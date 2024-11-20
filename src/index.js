const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/message')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 7000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket Connection')

    socket.on('join', ({ username, room}) => {
        socket.join(room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))
    })

    socket.on('sendMessage', (message, callBack) => {
        io.emit('message', generateMessage(message))
        callBack('Delivered!')
    })

    socket.on('sendLocation', (coords, callBack) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude} `))
        callBack()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left'))
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})