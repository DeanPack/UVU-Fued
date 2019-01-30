# UVU-Fued

## To Run
```
node server.js
```

## MongoDB Setup
```
use UVU-Fued
db.createCollection("questions")
mongoimport --db UVU-Fued --collection questions --file questions.json --jsonArray
```

## Dependancies

### Node modules/middleware
```
npm install express
npm install mongodb
npm install compression
npm install morgan
npm install serve-favicon

```
