import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { buildMessage } from './util.js';
import {
	activateUser,
	deactivateUser,
	getAllActiveRooms,
	getUser,
	getUsersInRoom,
} from './users.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.get('/hello', (req, res) => {
	res.json({ message: 'Hello, world!' });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: { origin: ['*'] },
});

console.log('Server time:', new Date().toLocaleString());

io.on('connection', (socket) => {
	console.log(`User ${socket.id} connected`);

	socket.emit('message', buildMessage('SYSTEM', 'Bienvenido a Chat App!'));

	socket.on('enterRoom', ({ username, room }) => {
		const prevRoom = getUser(socket.id)?.room;
		if (prevRoom) {
			socket.leave(prevRoom);
			io.to(prevRoom).emit(
				'message',
				buildMessage('SYSTEM', `${username} ha dejado la sala.`),
			);
		}

		const user = activateUser(socket.id, username, room);

		if (prevRoom) {
			io.to(prevRoom).emit('userList', { users: getUsersInRoom(prevRoom) });
		}

		socket.join(user.room);

		socket.emit(
			'message',
			buildMessage('SYSTEM', `Ingresaste a la sala: ${user.room}`),
		);

		socket.broadcast
			.to(user.room)
			.emit(
				'message',
				buildMessage('SYSTEM', `${user.name} ha ingresado a la sala.`),
			);

		io.to(user.room).emit('userList', { users: getUsersInRoom(user.room) });

		io.emit('roomList', { rooms: getAllActiveRooms() });
	});

	socket.on('disconnect', () => {
		console.log(`User ${socket.id} disconnected`);
		const user = getUser(socket.id);
		deactivateUser(socket.id);

		if (user) {
			io.to(user.room).emit(
				'message',
				buildMessage('SYSTEM', `${user.name} ha salido de la sala.`),
			);

			io.to(user.room).emit('userList', { users: getUsersInRoom(user.room) });

			io.emit('roomList', { rooms: getAllActiveRooms() });
		}
	});

	socket.on('message', ({ name, message }) => {
		const room = getUser(socket.id)?.room;
		if (room) {
			io.to(room).emit('message', buildMessage(name, message));
		}
	});

	socket.on('typing', (name) => {
		const room = getUser(socket.id)?.room;
		if (room) {
			socket.broadcast.to(room).emit('typing', name);
		}
	});
});

httpServer.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
