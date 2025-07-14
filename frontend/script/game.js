const createElement = (tag, attributes, id, content) => {
	const element = document.createElement(tag)
	for (const key in attributes) {
		element.setAttribute(key, attributes[key])
	}
	if (id) element.id = id
	if (content) element.textContent = content
	return element
}

function updateBingoNumber(number) {
	const bossCell = document.getElementById('boss')
	bossCell.textContent = data.number
}

function startSynchronizedTimer(startTime, maxDuration, display) {
	const start = new Date(startTime).getTime();
	const totalDuration = maxDuration * 60 * 1000;

	const countdown = setInterval(function () {
		const now = Date.now();
		const elapsedTime = now - start;
		let remainingTime = totalDuration - elapsedTime;

		if (remainingTime < 0) {
			clearInterval(countdown)
			display.textContent = '00:00'
			window.alert('Game over! No one won.')
			if (userId == hostId) {
				socket.emit('game ended', {roomId: roomId})
			}
			return
		}

		let secondsLeft = Math.floor(remainingTime / 1000)
		let minutes = parseInt(secondsLeft / 60, 10)
		let seconds = parseInt(secondsLeft % 60, 10)

		minutes = minutes < 10 ? '0' + minutes : minutes
		seconds = seconds < 10 ? '0' + seconds : seconds

		display.textContent = minutes + ':' + seconds
	}, 1000)
}

function callNumber() {
	setInterval(function () {
		if (userId == hostId) {
			socket.emit('generate random number', {
				roomId: roomId,
			})
		}
	}, 1000)
}

function markNumber(cell) {
	const [playerId, row, col] = cell.id.split('-')
	const cell_id = cell.id
	const isMarked = cell.classList.contains('marked')
	socket.emit('user marked number', {roomId, playerId, row, col, isMarked, cell_id})
}

function checkWon(user_id, room_id) {
	socket.emit('check won', {user_id: user_id, room_id: room_id, user_name: userName})
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

socket.on('update card marked', function (data) {
	const userCard = document.getElementById(`${data.playerId}-${data.row}-${data.col}`)
	userCard.classList.toggle('marked')
})
socket.on('player won', function (data) {
	if (userId == data.playerId) {
		socket.emit('game ended', {roomId: roomId})
		alert('You won the game!')
	} else {
		alert(data.playerUsername + ' won the game!')
	}
})
socket.on('finished cleanup', async function (data) {
	await sleep(1000)
	window.location.href = `/waiting/${data.roomId}`
})
socket.on('player not won', function (data) {
	if (userId == data.playerId) {
		alert('You did not win, check your card again!')
	}
})
socket.on('error', function (data) {
	const {error} = data
	window.alert(error)
	window.location.href = '/lobby'
})
socket.on('number generated', function (data) {
	const calledNumbersDiv = document.getElementById('called-numbers')
	calledNumbersDiv.append(createElement('div', {class: 'ball'}, null, data.number))
	calledNumbersDiv.scrollLeft = calledNumbersDiv.scrollWidth
	document.getElementById('boss').innerText = data.number
})

window.onload = async function () {
	const maxGameTime = 10 // Maximum game time in minutes
	var display = document.querySelector('#timer')
	startSynchronizedTimer(startTime, maxGameTime, display)
	if (userId == hostId) {
		const response = await fetch(`/api/draw_number/${roomId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				roomId: parseInt(roomId),
			}),
		})
		if (response.ok) {
			socket.emit('generate random number', {
				roomId: roomId,
			})
		}else{
			console.log('Number already generated!')
			return
		}
	}
}