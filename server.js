
//load core modules
const express = require('express')

//load expess middleware
const compression = require('compression')
const logger = require('morgan')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
// const helmet = require('helmet')

const apiRoutes = require("./api-routes")

let app = express()


//use the middleware
app.use(logger('dev'))

app.use(compression())

app.use(favicon(`${__dirname}/web/img/favicon.ico`))

app.use(express.static(`${__dirname}/web`))

// API Calls will go in the api-routes.js file
app.use('/api', apiRoutes)

app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(bodyParser.json())

app.get('*', function(req, res) {
	res.status(404).sendfile(`${__dirname}/web/404.html`)
})

//start the server
const server = app.listen(8080, process.env.IP, 511, function() {
	console.log(`Server listening on ${server.address().address}:${server.address().port}`);

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