
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

// Get question by id return HTML for modal
route.get('/question/modal', function (req, res) {
	let query = { _id: ObjectId(req['query']['id']) }
	database.collection('questions').find(query).toArray( (err, results) => {
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
	let query = { question: new RegExp(`^${req['query']['searchby']}`, 'i') }
	database.collection('questions').find(query).toArray( (err, results) => {
		res.send(results)
    })
})

// Create a new question
route.put('/questions/new/', function (req, res) {
var myobj = { name: "Company Inc", address: "Highway 37" };
  database.collection("questions").insertOne(myobj, function(err, res) {
    if (err) 
        throw err
    database.log("1 question inserted");
  });
})

// Update question
route.post('/questions', function (req, res) {
	// We need to query to find the old question before updating it. Once we get the old question we then can use those restuls to update the question
	let query = { _id: ObjectId(req['body']['_id']) }

	database.collection('questions').find(query).toArray( (err, results) => {
		// Safer to remove the ID so we dont change that by accident
		let updateData = req['body']
    	delete updateData['_id']

	 	database.collection('questions').updateOne(results[0], {'$set': updateData}, (err, newResults) => {
	 		res.send(newResults)
     	})
    })
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