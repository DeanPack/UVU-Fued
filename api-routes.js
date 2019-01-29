
const route = require('express').Router()

// Set default API Call
route.get('/', function (req, res) {
    res.json({
       status: 'UVU Fued API',
       message: 'Welcome to UVU Fued API',
    })
})

module.exports = route