const getByID = (id) => {
	return document.getElementById(id)
}

const createElement = (tag, attributes, id, content) => {
	const element = document.createElement(tag)
	for (const key in attributes) {
		element.setAttribute(key, attributes[key])
	}
	if (id) element.id = id
	if (content) element.textContent = content
	return element
}

const updateUserStatus = (userId, status) => {
	const statusText = getByID(`status-${userId}`)
	statusText.textContent = status ? 'Ready' : 'Not Ready'

	const buttonsStatus = getByID(`readyButton-${userId}`)
	if (buttonsStatus) buttonsStatus.textContent = status ? 'Ready' : 'Not Ready'

	const statusColor = getByID(`status-color-${userId}`)
	statusColor.style.backgroundColor = status ? 'rgb(181, 255, 69)' : 'rgb(255, 0, 0)'
}

function markReady(roomId, userId) {
	console.log('clicked ready')
	socket.emit('player ready', {roomId: roomId, userId: userId})
}

async function exitRoom(roomId, userId) {
	console.log('clicked exit')
	const playerElement = document.getElementById(`players`)
	if (userId === hostId && playerElement.childElementCount > 1) {
		window.alert('Host cannot exit the room if there are other players in the room. Please ask other players to exit the room first.')
		return
	}
	if (userId === hostId && playerElement.childElementCount === 1) {
		const userResponse = confirm('Do you want to proceed? This will delete the room.')
		if (userResponse) {
			const response = await fetch(`/host_exit/${roomId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: parseInt(userId),
					roomId: parseInt(roomId),
				}),
			})
			if (response.ok) {
				socket.emit('delete room', {roomId: roomId, userId: userId})
				window.location.href = '/lobby'
			} else {
				const errorData = await response.json();
				window.alert('Failed to delete room:', errorData.message)
			}
			return
		} else {
			return
		}
	}
	socket.emit('exit room', {roomId: roomId, userId: userId})

	window.location.href = '/lobby'
}

const createPlayerElement = (userId, username) => {
	const cardPlayer = createElement('div', {class: 'card'}, `player-${userId}`)
	const faceTag = createElement('i', {class: 'fa-solid fa-face-smile'})

	const cardContent = createElement('div', {class: 'card-content'})
	const playerTag = createElement('p', {class: 'name'}, `username-${userId}`, username.toUpperCase())
	cardContent.append(playerTag)

	const statusText = createElement('span', {class: 'userStatus'}, `status-${userId}`, 'Not Ready')
	const statusColor = createElement('span', {class: 'statusColor', style: 'background-color: rgb(255, 0, 0)'}, `status-color-${userId}`)

	cardPlayer.append(faceTag, cardContent, statusText, statusColor)
	return cardPlayer
}


function addPlayer(player, roomId, userId) {
	const playerContainer = getByID('players')
	let playerCard = getByID(`player-${userId}`)

	if (!playerCard) {
		playerCard = createPlayerElement(userId, player)

		const divStartAndExit = createElement('div', {class: 'actionBtn'})
		if (userId === sessionUserId) {
			const readyButton = createElement('button', {class: 'button ready'}, `readyButton-${userId}`, 'Not Ready')
			readyButton.onclick = () => {
				markReady(roomId, userId)
			}
			playerCard.append(readyButton)

			const exitButton = createElement('button', {class: 'exitButton'})
			exitButton.onclick = () => {
				exitRoom(roomId, userId)
			}
			divStartAndExit.appendChild(exitButton)
			playerCard.append(divStartAndExit)
		}

		if (hostId === sessionUserId && userId !== sessionUserId) {
			const kickButton = createElement('button', {class: 'buttons kick'}, null, 'Kick')
			kickButton.onclick = function () {
				kick(roomId, userId)
			}
			playerCard.appendChild(kickButton)
		}
		playerContainer.appendChild(playerCard)
	}
}

function kick(roomId, userId) {
	socket.emit('exit room', {roomId: roomId, userId: userId})
	socket.emit('kicking player', {roomId: roomId, userId: userId})
}



function startGame() {
	const playersContainer = document.getElementById('players')
	const players = playersContainer.querySelectorAll('.card')
	const playerIds = Array.from(players).map((player) => parseInt(player.id.replace('player-', '')))

	if (playerIds.length < 2 || playerIds.length > 4) {
		window.alert('You need at least 2 and maximum 4 players to start the game')
		return
	}
	const allPlayers = document.querySelectorAll('.userStatus') // Get all player divs
	const playersStatus = Array.from(allPlayers).map((player) => player.innerText)

	if (playersStatus.includes('Not Ready')) {
		window.alert('Not all players are ready.')
		return
	}

	const userResponse = window.confirm('Are you sure you want to start the game?')
	if (!userResponse) return
	startingGame(playerIds, roomId, hostId)
}

async function startingGame(playerIds, roomId, hostId) {
	try {
		const response = await fetch(`/starting_game/${roomId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				host_id: parseInt(hostId),
				players: playerIds,
				room_id: parseInt(roomId),
			}),
		})
		const data = await response.json()
		if (response.ok) {
			socket.emit('starting game', {roomId: roomId})
			window.location.href = `/game/${roomId}`
		} else {
			window.alert('Failed to join room:', data.message)
		}
	} catch (error) {
		console.error('Failed to join room', error)
	}
}

socket.on('player ready', function (data) {
	const {userId, status} = data
	updateUserStatus(userId, status)
})


socket.on('player exited', function (data) {
	const {userId} = data
	const playerElement = document.getElementById('player-' + userId)
	if (playerElement) {
		playerElement.parentNode.removeChild(playerElement)
	}
})

socket.on('new player joined', function (data) {
	const player = data.username
	const roomId = data.roomId
	const userId = data.userId
	addPlayer(player, roomId, userId)
})

socket.on('error', function (data) {
	const {error} = data
	window.alert(error)
	window.location.href = '/lobby'
})

socket.on('player kicked', function (data) {
	user_id = parseInt(data.userId)
	session_id = parseInt(sessionUserId)
	console.log(user_id === session_id)
	if (user_id === session_id) {
		window.alert('You have been kicked from the room.')
		window.location.href = '/lobby'
	}
})

socket.on('game started', function (data) {
	window.location.href = `/game/${data.roomId}`
})