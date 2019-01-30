
const route = require('express').Router()
const mongo = require('mongodb');

const MongoClient = require('mongodb').MongoClient;
const mongoQuestionsURL = "mongodb://localhost:27017/UVU-Fued"

let database

MongoClient.connect(mongoQuestionsURL, { useNewUrlParser: true }, function(err, db) {
	if (err) throw err;

	console.log("Connected to Database!")
	database = db.db("UVU-Fued");

})

// Set default API Call
route.get('/', function (req, res) {
    res.json({
       status: 'UVU Fued API',
       message: 'Welcome to UVU Fued API',
    })
})

// Returns all Questions
route.get('/questions', function (req, res) {
	database.collection('questions').find().toArray( (err, results) => {
		res.send(results)
    })
})

// Search for question
route.get('/questions/search', function (req, res) {

})

// Create a new question
route.put('/questions/new/', function (req, res) {

})

// Update question
route.post('/questions', function (req, res) {

})

module.exports = route