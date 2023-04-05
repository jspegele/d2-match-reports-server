const axios = require("axios").default

const apiRoot = "https://www.bungie.net/Platform"
const contentPathRoot = "https://www.bungie.net"
const requiredContentPaths = [
  "DestinyActivityDefinition",
  "DestinyActivityModeDefinition",
  "DestinyActivityTypeDefinition",
  "DestinyClassDefinition",
  "DestinyInventoryItemLiteDefinition",
]

// Initialize Firebase
const firebase = require("firebase-admin")
const serviceAccount = require("../config/serviceaccount.json")
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})
const database = firebase.database()

module.exports = function(app) {
  // Save definition to firebase
  function handleSaveDefinition(node, data) {
    // Save simplified definition to firebase
    database
      .ref("contentPaths/" + node)
      .set(JSON.stringify(data))
      .then(() => console.log(node + " saved to firebase"))
  }
  
  // Create single definition
  function convertDefinition(node) {
    // get manifest from bungie api
    axios.get(`${apiRoot}/Destiny2/Manifest/`).then((manifestRres) => {
      const manifest = manifestRres.data.Response
      const contentPaths = manifest.jsonWorldComponentContentPaths.en
  
      // get definition json file
      axios
        .get(contentPathRoot + contentPaths[node])
        .then((definitionRes) => {
          const definition = definitionRes.data
          const simplifiedDefinitionArray = {}
  
          for (const [key, value] of Object.entries(definition)) {
            if (node === "DestinyInventoryItemLiteDefinition")
              simplifiedDefinitionArray[key] = {
                name: value.displayProperties.name,
                icon: value.displayProperties.icon,
              }
            else if (node === "DestinyActivityModeDefinition")
              simplifiedDefinitionArray[key] = {
                name: value.displayProperties.name,
                modeType: value.modeType,
              }
            else
              simplifiedDefinitionArray[key] = {
                name: value.displayProperties.name,
              }
          }
          handleSaveDefinition(node, simplifiedDefinitionArray)
        })
        .catch(() => console.log("Node " + node + " not found"))
    })
  }
  
  function convertDefinitions() {
    // for testing
    database
      .ref("lastupdated")
      .set(new Date().toISOString)
      .then(() => console.log("version updated"))

    // get manifest from bungie api
    axios
      .get(`${apiRoot}/Destiny2/Manifest/`)
      .then((res) => {
        const bungieVersion = res.data.Response.version

        // get 'local' version from firebase
        database
          .ref("version")
          .once("value", (snap) => {
            const localVersion = snap.val()
            
            // return function if local version is up to date
            if (bungieVersion === localVersion) {
              console.log('up to date')
              return
            }

            // Create convertDefinition calls
            requiredContentPaths.forEach((path) => convertDefinition(path))

            // Set local version
            database
              .ref("version")
              .set(bungieVersion)
              .then(() => console.log("version updated"))
          })
      })
      .catch((err) => console.log(err))
  }
  
  convertDefinitions()
}
