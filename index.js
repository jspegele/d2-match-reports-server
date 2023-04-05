require("dotenv").config()
const express = require("express")
const secure = require("ssl-express-www")
const app = express()
const axios = require("axios").default
const https = require("https")

// Middleware
app.use(secure)
app.use(express.json())

app.get('/', (req, res) => {
  res.send('D2 Activity History Server')
})

// Add headerto all requests
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  // const now = new Date()
  // console.log(req.method, req.url, now.toISOString())
  next()
})

require('./routes/contentPathsJson')(app)

// Listen for connections
const PORT = process.env.PORT ? `0.0.0.0:${process.env.PORT}` : 3001
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})
