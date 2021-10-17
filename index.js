const http = require('http')
const socketIO = require('socket.io')
const express = require('express')

const online = {}

const PORT = process.env.PORT || 4000

const app = express()

app.use('/', express.static('./build'))

const server = http.createServer(app)

const io = socketIO(server)

io.on('connection', client => {

	client.on('new_login', username => {

		online[username] = client

		client.emit('welcome', Object.keys(online))
		client.broadcast.emit('new_online', username)
	})

	client.on('logout', username => {

		delete online[username]

		client.broadcast.emit('user_left', username)
	})

	client.on('send_message', ({ sender, receiver, message, }) => {

		if (online[receiver]) {

			online[receiver].emit('new_private_message', { sender, message, })
		}
	})
})

server.listen(PORT, () => console.log(PORT))
