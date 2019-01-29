# UVU-Fued

## To Run
```
node server.js
```

## MongoDB Setup
```
db.createCollection("UVU-Fued")
mongoimport --db dbName --collection UVU-Fued --file questions.json --jsonArray
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
