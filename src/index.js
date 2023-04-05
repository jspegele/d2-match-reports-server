require("dotenv").config()
const express = require("express")
const secure = require("ssl-express-www")
const app = express()
const axios = require("axios").default
const https = require("https")
const fs = require("fs")
const unzipper = require("unzipper")

// Middleware
app.use(secure)
app.use(express.json())

// Add headerto all requests
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  // const now = new Date()
  // console.log(req.method, req.url, now.toISOString())
  next()
})

// Returns full manifest
app.get("/api/manifest/get", function (req, res, next) {
  axios
    .get(`${apiRoot}/Destiny2/Manifest/`)
    .then((manifestRes) => {
      res.json(manifestRes.data)
    })
    .catch((err) => next(err))
})

require('./contentPathsJson')(app)

// Listen for connections
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})
