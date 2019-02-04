
const route = require('express').Router()
const mongo = require('mongodb');

const MongoClient = require('mongodb').MongoClient;
const mongoQuestionsURL = "mongodb://localhost:27017/UVU-Fued"
const ObjectId = require('mongodb').ObjectID;

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

// Return all Questions
route.get('/questions', function (req, res) {
	database.collection('questions').find().toArray( (err, results) => {
		res.send(results)
    })
})

// Get question by id
route.get('/question', function (req, res) {
	let query = { _id: ObjectId(req['query']['id']) }
	database.collection('questions').find(query).toArray( (err, results) => {
		res.send(results)
    })
})

// Search for question by id return HTML for modal
route.get('/question/modal', function (req, res) {
	let query = { _id: ObjectId(req['query']['id']) }
	database.collection('questions').find(query).toArray( (err, results) => {
		console.log(results[0]['answer'])
		let returnString = `<div class="input-group editBoxes">`
		returnString += `<div class="input-group-prepend">`
		returnString += `<span class="input-group-text">Question: </span></div>`
		
		returnString += `<textarea class="form-control" aria-label="Question: ">${results[0]['question']}</textarea>`
		returnString += `</div>`
		
		returnString += `<div class="input-group editBoxes">`
		returnString += `<input type="text" class="form-control titleBox" onfocus="this.blur();" readonly value="Answer"/>`
    	returnString += `<span class="input-group-text">-</span>`
    	returnString += `<input type="text" class="form-control titleBox" onfocus="this.blur();" readonly value="Points"/>`
    	returnString += `</div>`

		for (let i = 0; i < results[0]['answer'].length; i++) {
			console.log(results[0]['answer'][i])
			returnString += `<div class="input-group editBoxes">`
			returnString += `<input type="text" class="form-control" value="${results[0]['answer'][i]['text']}"/>`
    		returnString += `<span class="input-group-text">-</span>`
    		returnString += `<input type="text" class="form-control" value="${results[0]['answer'][i]['pts']}"/>`
    		returnString += `</div>`
		}

		returnString += `</div>`

		res.send(returnString)
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

// Delete question
route.delete('/question', function (req, res) {
var myquery = { _id: ObjectId(req['query']['id']) }
  database.collection("questions").deleteOne(myquery, function(err, obj) {
    if (err) 
        throw err
    console.log("1 question deleted")
})
})

module.exports = route