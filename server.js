
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

app.get('*', function(req, res) {
	res.status(404).sendFile(`${__dirname}/web/404.html`)
})

//start the server
const server = app.listen(8080, process.env.IP, 511, function() {
	console.log(`Server listening on ${server.address().address}:${server.address().port}`);

})

const io = require('socket.io')(server)

let games = []

io.on('connection', (socket) => {
	console.log('User connected')

	socket.on('join', function(data) {

		let game = {}

		if (data.type === "judge"){
			console.log(`Judge joined room ${data.room}`)
			socket.join(data.room);

			game["judge"] = socket

		}else if(type === "screen"){
			console.log(`screen joined room ${data.room}`)
			socket.join(data.room);
			game["screen"] = socket

			if (games[data.room][team1Pts] > 0 || games[data.room][team2Pts] > 0)
			{
				console.log("Game already in progress. Sending current game info to client")
				soket.emit('gameInProgress',games[room])
			}

		}else{
			console.log("Unknown client type, disconnect from client")
		}

		if (!games[data.room]){
			games[data.room] = game
			games[data.room]['team1'] = 0
			games[data.room]['team2'] = 0
		}
	})

	socket.on('questionID', function(data) {
		console.log(`Updating Question ID for room ${data.room}`)

		games[data.room]["questionID"] = data.questionID

		console.log("Sending updated question to clients")

		socket.to('data.room').emit('questionID', data.questionID);
	})

	socket.on('commands', function(data) {
		console.log(`Sending command ${Object.keys(data.command)} to room ${data.room}`)

		socket.to('data.room').emit('questionID', data.command);

	})

	socket.on('points', function(data) {
		console.log(data)
		console.log(`Updating points for room ${data.room}`)

		games[data.room][data.points.teamID] = data.points.pts

		console.log(`Team 1: ${games[data.room]['team1']} Team 2: ${games[data.room]['team2']}`)

	})

	socket.on('disconnect', () => {
		console.log('User disconnected')
	})
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