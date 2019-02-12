
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

io.on('connection', (socket) => {
  console.log('User connected')
  
socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})


//server close functions
function gracefulShutdown() {
	console.log()
	console.log('Starting Shutdown ...\n')
	server.close(function() {
		console.log('Shutdown complete')
		process.exit(0)
	})
}

process.on('SIGTERM', gracefulShutdown)

process.on('SIGINT', gracefulShutdown)