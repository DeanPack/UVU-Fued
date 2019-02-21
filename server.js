
const ROOM_CODE_LEN = 5
//load core modules
const express = require('express')

//load expess middleware
const helmet = require('helmet')
const compression = require('compression')
const logger = require('morgan')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')


const apiRoutes = require("./api-routes")

let app = express()


//use the middleware
app.use(logger('dev'))

app.use(compression())

app.use(favicon(`${__dirname}/web/img/favicon.ico`))

app.use(express.static(`${__dirname}/web`))


app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(bodyParser.json())

// API Calls will go in the api-routes.js file AND MUST BE AFTER THE PARSERS
app.use('/api', apiRoutes)


//start the server
const server = app.listen(8080, process.env.IP, 511, function() {
	console.log(`Server listening on ${server.address().address}:${server.address().port}`);

})

const io = require('socket.io')(server)

let games = []

io.on('connection', (socket) => {
	console.log('User connected')

	socket.on('join', function(data) {
// Check if the room exists
		if (data.room in games){
			// Check if room already has a judge
			if (data.type === "judge"){
				if(games[data.room]["judge"]){
					console.log("Game already has a judge!")
					socket.emit('er',"alreadyJudge")
				}else{
					console.log(`Judge joined room ${data.room}`)
					socket.join(data.room);

					games[data.room]["judge"] = socket

					socket.emit('command', 'startGame')
				}
			}else if(data.type === "screen"){
				console.log(`screen joined room ${data.room}`)
				socket.join(data.room);
				games[data.room]["screen"] = socket
				console.log("Game already in progress. Sending current game info to client")
				socket.emit('gameInProgress',games[data.room]["gameData"])

			}else{
				console.log("Unknown client type, disconnect from client")
				socket.disconnect(true)
			}
		}else{
			console.log("Game does not exist")
			socket.emit('er',"noGameFound")
		}
	})

	socket.on('questionID', function(data) {
		console.log(`Updating Question ID for room ${data.room}`)

		games[data.room]["gameData"]["questionID"] = data.questionID

		console.log("Sending updated question to clients")

		socket.to('data.room').emit('questionID', data.questionID);

		// New question, if there are any recorded card flips delete them
		if(games[data.room]["gameData"]["cardFlips"]){
			delete games[data.room]["gameData"]["cardFlips"]
		}
	})

	socket.on('commands', function(data) {
		console.log(`Sending command ${Object.keys(data.command)} to room ${data.room}`)
		socket.to(data.room).emit('command', data.command);
		
		// Keep track of card flips
		if (data.command.cardFlip)
		{
			let cardsFlipped = []

			if (games[data.room]["gameData"]["cardFlips"]){
				cardsFlipped = games[data.room]["gameData"]["cardFlips"]
			}

			cardsFlipped.push(data.command["cardFlip"])

			games[data.room]["gameData"]["cardFlips"] = cardsFlipped

			console.log(games[data.room]["gameData"]["cardFlips"])
		}
	})

	socket.on('points', function(data) {
		console.log(`Updating points for room ${data.room}`)

		games[data.room]["gameData"][data.points.teamID] = data.points.pts

		console.log(`Team 1: ${games[data.room]["gameData"]['team1']} Team 2: ${games[data.room]["gameData"]['team2']}`)
        socket.to(data.room).emit()

	})

	socket.on('disconnect', () => {
		console.log('User disconnected')

// Check if the judge disconnects. If so delete the game object from games array
		let gameToRemove = ""
		for(game in games){
			console.log(game)
			if (socket === games[game]["judge"]){
				gameToRemove = game
				break;
			}
		}

		if (gameToRemove.length > 0){
			console.log(`Judge disconnected from game ${gameToRemove} delete this game`)
			delete games[gameToRemove]
		}
	})
})

function makeRoomCode() {
	let text = ""
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	do
	{
		for (var i = 0; i < ROOM_CODE_LEN; i++){
			text += possible.charAt(Math.floor(Math.random() * possible.length))
		}
	} while(text in games)

	return text;
}

// Create a new Game
app.get('/game/newgame', function(req, res) {
	let game = {}

	let room = makeRoomCode()

	game["gameData"] = {}

	console.log(room)

	game["gameData"]['team1'] = 0
	game["gameData"]['team2'] = 0

	games[room] = game

	res.redirect(`/game/judge.html?room=${room}`)

})

// Join a game
app.get('/game/join', function(req,res) {
    //see if the game already exists
    res.redirect(`/game/client.html?room=${req['query']['code']}`)
})

app.get('*', function(req, res) {
	res.status(404).sendFile(`${__dirname}/web/404.html`)
})


//server close functions
function gracefulShutdown() {
	console.log()
	console.log('Starting Shutdown ...\n')
	io.sockets.emit('command', 'disconnect');
	server.close(function() {
		console.log('Shutdown complete')
		process.exit(0)
	})
}

process.on('SIGTERM', gracefulShutdown)

process.on('SIGINT', gracefulShutdown)