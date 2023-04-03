require("dotenv").config()
const express = require("express")
const path = require("path")
const secure = require("ssl-express-www")
const app = express()
const firebase = require("firebase-admin")
const axios = require("axios").default
const router = express.Router()
// const bodyParser = require("body-parser")

// Middleware
app.use(secure)
app.use(express.static(path.resolve(__dirname, "../client/build")))
app.use(express.json())
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))

// require('./utils/createRegistrationCodesObject')

// API Endpoint Test
// app.get("/api", (req, res) => {
//   res.json({ message: "Hello from server!" })
// })

// Return react app for all other get requests not handled above
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../client/build", "index.html"))
// })

// Initialize Firebase admin
var serviceAccount = require("./config/firebase-admin-config.json")
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})

app.get("/api/manifest/get", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  const database = firebase.database()
  database.ref("version").once(
    "value",
    (snap) => {
      console.log(snap.val())
    },
    (firebaseErr) => {
      console.log(firebaseErr)
    }
  )

  axios
    .get("https://www.bungie.net/Platform/Destiny2/Manifest/ ")
    .then((axiosRes) => {
      res.json(axiosRes.data)
    })
    .catch((axiosErr) => next(axiosErr))
})

// Listen for connections
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})
