import dotenv from 'dotenv'
dotenv.config() //{ path: './backend/database/config.env' }

import express, { Request, Response, NextFunction } from 'express'
import homeRouter from './routers'
import path from 'path'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { sessionData, requiredLoginAllSites, loginRequest, isPlayerInAnyRoom } from './middleware/auth'
import { logger } from './middleware/logger'
import * as db from './database/index'

import * as card from './middleware/card'

const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(sessionData)
app.use(logger)

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../frontend')))
app.set('views', path.join(__dirname, 'views')).set('view engine', 'ejs')
app.use(requiredLoginAllSites, isPlayerInAnyRoom)
app
app.use(express.json())

interface GameRoom {
	totalNumber: number[];
	intervalId: NodeJS.Timeout | null;
}
const gameRooms: { [key: string]: GameRoom } = {};

io.on('connection', (socket) => {
	socket.on('join room', (roomId) => {
		socket.join(roomId)
	})

	socket.on('chat message', (data) => {
		try {
			io.to(data.room).emit('chat message', {
				user: data.user,
				message: data.message,
				room: data.room,
			})
		} catch (error) {
			console.error('Error in chat message:', error)
		}

	})

	socket.on('create room', async (data) => {
		try {
			const isRoomOrHost = await db.RoomNameOrHostExist(data.roomName, data.user)
			if (isRoomOrHost.length > 0) {
				return io.to('lobby').emit('failed create room', { error: 'This room name exist! Please use other room name', user: data.user })
			}
			await db.createRoom(data.roomName, data.user, false)
			const player_id = await db.getUserIdByUsername(data.user)
			const room_id = await db.getRoomId(data.roomName, data.user)
			await db.addPlayerToRoom(player_id, room_id)
			await db.insertPlayerStatus(player_id, room_id)

			io.to('lobby').emit('update room', { roomName: data.roomName, user: data.user, roomId: room_id, status: false }) // Respond back to the client
		} catch (error) {
			console.error('Error in create room:', error)
		}
	})

	socket.on('player ready', async (data) => {
		try {
			const { roomId, userId } = data
			const playerStatus = await db.getPlayerStatus(userId, roomId)
			const updatedStatus = await db.updatePlayerStatus(userId, roomId, !playerStatus.status)
			io.to(String(roomId)).emit('player ready', { userId: userId, status: updatedStatus })
		} catch (error) {
			const { roomId, userId } = data
			console.error('Error in player ready:', error)
			await db.deleteRoom(roomId)
			io.to('lobby').emit('room deleted', { roomId: roomId })
			io.to(String(roomId)).emit('error', { error: "There is and error occur,removing room and redirecting to lobby" })
		}

	})

	socket.on('exit room', async (data) => {
		try {
			const { roomId, userId } = data
			await db.removePlayerFromRoom(userId, roomId)
			await db.deletePlayerStatus(userId, roomId)
			io.to(String(roomId)).emit('player exited', { userId: userId })
		} catch (error) {
			const { roomId, userId } = data
			console.error('Error in exit room:', error)
			await db.deleteRoom(roomId)
			io.to('lobby').emit('room deleted', { roomId: roomId })
			io.to(String(roomId)).emit('error', { error: "There is and error occur,removing room and redirecting to lobby" })
		}
	})
	socket.on('kicking player', async (data) => {
		try {
			const { roomId, userId } = data
			await db.deletePlayerStatus(userId, roomId)
			io.to(String(roomId)).emit('player kicked', { userId: userId })
		}
		catch (error) {
			const { roomId, userId } = data
			console.error('Error in kicking player:', error)
			await db.deleteRoom(roomId)
			io.to('lobby').emit('room deleted', { roomId: roomId })
			io.to(String(roomId)).emit('error', { error: "There is and error occur,removing room and redirecting to lobby" })
		}
	})

	socket.on('delete room', async (data) => {
		try {
			const { roomId } = data
			io.to('lobby').emit('room deleted', { roomId: roomId })
		} catch (error) {
			console.error('Error in delete room:', error)
			io.to('lobby').emit('error', { error: "There is and error occur,redirecting to Home page" })
		}
	})
	socket.on('new player joined', async (data) => {
		try {
			const { user, roomId } = data
			const user_id = await db.getUserIdByUsername(user)
			io.to(String(roomId)).emit('new player joined', {
				username: data.user,
				roomId: data.roomId,
				userId: user_id,
			})
		} catch (error) {
			const { user, roomId } = data
			console.error('Error in new player joined:', error)
			await db.deleteRoom(roomId)
			io.to('lobby').emit('room deleted', { roomId: roomId })
			io.to(String(roomId)).emit('error', { error: "There is and error occur,removing room and redirecting to lobby" })
		}

	})

	socket.on('starting game', async (data) => {
		try {
			await db.updateRoomStatus(data.roomId, true)
			const room_id = String(data.roomId)
			if (!gameRooms[room_id]) {
				gameRooms[room_id] = { totalNumber: [], intervalId: null };
			}
			io.to('lobby').emit('update status game', {
				roomId: data.roomId, status: true
			})
			io.to(data.roomId).emit('game started', {
				roomId: data.roomId,
			})
		} catch (error) {
			console.error('Error in starting game:', error)
			await db.deleteRoom(data.roomId)
			io.to('lobby').emit('room deleted', { roomId: data.roomId })
			io.to(data.roomId).emit('error', { error: "There is and error occur,removing room and redirecting to lobby" })
		}

	})

	socket.on('generate random number', async (data) => {
		try{
			const roomId = String(data.roomId);
			if (!gameRooms[roomId]) {
				console.log('Room not found')
			}
			if (gameRooms[roomId]) {
				gameRooms[roomId].totalNumber = card.generateDistinctNumbers(75);
	
				gameRooms[roomId].intervalId = setInterval(async () => {
					const nextNumber = gameRooms[roomId].totalNumber.pop();
					if (nextNumber !== undefined) {
						await db.insertDrawnNumber(data.roomId, nextNumber)
						io.to(roomId).emit('number generated', { number: nextNumber })
					} else {
						clearInterval(gameRooms[roomId].intervalId!);
						gameRooms[roomId].intervalId = null;
					}
				}, 1000);
			}
		}catch(error){
			const roomId = String(data.roomId);
			console.error('Error in generate random number:', error)
			await db.deleteRoom(data.roomId)
			io.to('lobby').emit('room deleted', { roomId: data.roomId })
			io.to(roomId).emit('error', { error: "There is and error occur,removing room and redirecting to lobby" })
		}
		
	})

	socket.on('user marked number', async (data) => {
		try{
			const roomId = String(data.roomId)
			if (data.isMarked) {
				await db.deleteMarkedNumber(data.playerId, data.roomId, data.cell_id)
			} else {
				await db.insertMarkedNumber(data.playerId, data.roomId, data.cell_id)
			}
			io.to(roomId).emit('update card marked', { roomId: data.roomId, playerId: data.playerId, row: data.row, col: data.col, isMarked: data.isMarked })
		}catch(error){
			const roomId = String(data.roomId)
			console.error('Error in user marked number:', error)
			await db.deleteRoom(data.roomId)
			io.to('lobby').emit('room deleted', { roomId: data.roomId })
			io.to(roomId).emit('error', { error: "There is and error occur,removing room and redirecting to lobby" })
		}
		
	})
	socket.on('check won', async (data) => {
		try{
			const roomId = String(data.room_id)
			const playerCard = await db.getCardByPlayer(data.user_id, data.room_id)
			const drawn_numbers = await db.getDrawnNumber(data.room_id)
			const calledNumber = drawn_numbers.map((result) => result.drawn_number)
			const win = card.checkForWin(playerCard, calledNumber)
			if (win) {
				io.to(roomId).emit('player won', { roomId: data.room_id, playerId: data.user_id, playerUsername: data.user_name })
			} else {
				io.to(roomId).emit('player not won', { roomId: data.room_id, playerId: data.user_id })
			}
		}catch(error){
			const roomId = String(data.room_id)
			console.error('Error in check won:', error)
			await db.deleteRoom(data.room_id)
			io.to('lobby').emit('room deleted', { roomId: data.room_id })
			io.to(roomId).emit('error', { error: "There is and error occur,removing room and redirecting to lobby" })
		}
		
	})
	socket.on('game ended', async (data) => {
		try{
			const roomId = String(data.roomId);
			if (gameRooms[roomId] && gameRooms[roomId].intervalId) {
				clearInterval(gameRooms[roomId].intervalId!);
				gameRooms[roomId].intervalId = null;
			}
			await db.deleteOldCards(data.roomId)
			await db.deleteStartTime(data.roomId)
			await db.deleteDrawnNumber(data.roomId)
			await db.insertDrawnNumber(data.roomId, 0)
			await db.resetPlayerStatus(data.roomId)
			await db.deleteAllMarkedNumber(data.roomId)
	
			await db.updateRoomStatus(data.roomId, false)
	
			io.to('lobby').emit('update status game', {
				roomId: data.roomId, status: false
			})
			io.to(data.roomId).emit('finished cleanup', { roomId: data.roomId })
		}
		catch(error){
			const roomId = String(data.roomId)
			console.error('Error in game ended:', error)
			await db.deleteRoom(data.roomId)
			io.to('lobby').emit('room deleted', { roomId: data.roomId })
			io.to(roomId).emit('error', { error: "There is and error occur,removing room and redirecting to lobby" })
		}
	})
})

app.use('/', homeRouter)

server.listen(process.env.PORT_ENV || 8000, () => {
	console.log(`Server is running at http://localhost:${process.env.PORT_ENV || 8000}`)
})
