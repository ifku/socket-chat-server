const express = require('express');
const {
	createServer
} = require('node:http');
const {
	join
} = require('node:path');
const {
	Server
} = require('socket.io');
const User = require('../entity/User');

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});
const port = process.env.PORT || 3000;
const users = new Map();

let currentIndex = 1;

app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
	console.log('User connected: ', socket.id);
	const userId = currentIndex.toString().padStart(5, '0');
	const username = `User-${userId}`;
	const createdAt = new Date();
	const updatedAt = new Date();
	const user = new User(userId, username, socket.id, createdAt, updatedAt);
	users.set(userId, user);
	currentIndex++;

	socket.on('send-message', (data) => {
		console.log(`Message sent to ${data.receiver_id}: ${data.msg}`);
		const receiver = users.get(data.receiver_id);
		try {
			if (receiver) {
				io.to(receiver.socketId).emit('receive-message', {
					sender_id: userId,
					sender_username: user.username,
					msg: data.msg,
				});
			} else {
				console.log('Receiver not found');
			}
		} catch (error) {
			console.log(error);
		}
	});

	socket.on('receive-message', (data) => {
		console.log(`Message received from: ${data.sender_username} and the message is: ${data.msg}`);
	});

	socket.on('idle', () => {
		console.log('User idle: ', userId);
	});

	socket.on('reconnect', () => {
		console.log('User reconnected: ', userId);
		const user = users.get(userId);
		user.socketId = socket.id;
		user.updatedAt = new Date();
	});

	socket.on('disconnect', () => {
		console.log('User disconnected:', userId);
		const user = users.get(userId);
		io.emit('user-disconnected', {
			userId,
			username: user.username
		});
	});

	console.log('Users: ', users);
});

server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});