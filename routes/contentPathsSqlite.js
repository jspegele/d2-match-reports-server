const axios = require("axios").default

const apiRoot = "https://www.bungie.net/Platform"
const contentPathRoot = "https://www.bungie.net"

// Initialize SQLite3 database
const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database("manifest/world_sql_content.sqlite3")


module.exports = function(app) {
  // Updates local manifest files
  app.get("/api/manifest/update", function (req, res, next) {
    const manifestData = require("../manifest/manifestData.json")
  
    // get manifest from bungie api
    axios
      .get(`${apiRoot}/Destiny2/Manifest/`)
      .then((manifestRes) => {
        const manifest = manifestRes.data.Response
  
        // compare latest manifest version to stored version
        if (manifestRes.data.Response.version === manifestData.version) {
          res.send("success")
        } else {
          const filePath = "manifest/"
          const zipFileName = "world_sql_content.zip"
          const sqlFileName = "world_sql_content.sqlite3"
  
          const zippedFile = fs.createWriteStream(filePath + zipFileName)
          const request = https.get(
            contentPathRoot + manifest.mobileWorldContentPaths.en,
            function (response) {
              response.pipe(zippedFile)
  
              // after download completed close filestream
              zippedFile.on("finish", () => {
                console.log("Download completed")
                zippedFile.close()
  
                // unzip file
                const unzippedFile = fs
                  .createReadStream(filePath + zipFileName)
                  .pipe(unzipper.Extract({ path: filePath }))
                  .promise()
                  .then(() => {
                    // rename file
                    fs.readdirSync(filePath).forEach((file) => {
                      if (file.endsWith(".content"))
                        fs.rename(filePath + file, filePath + sqlFileName, () => {
                          console.log("File renamed")
                          fs.writeFileSync(
                            "./manifest/manifestData.json",
                            JSON.stringify({
                              ...manifestData,
                              version: manifestRes.data.Response.version,
                            })
                          )
                          res.send("success")
                        })
                    })
                  })
              })
            }
          )
        }
      })
      .catch((err) => next(err))
  })
  
  // Returns all class definitions
  app.get("/api/classdefinitions", function (req, res, next) {
    db.all("SELECT id, json FROM DestinyClassDefinition", (error, rows) => {
      rows.forEach((row) => {
        console.log(row.id + row.json)
      })
    })
  })
  
  // Returns json for a single activity definition
  app.get("/api/activity/:refId/definition", function (req, res, next) {
    db.get(
      `SELECT json FROM DestinyActivityDefinition WHERE id=${req.params.refId}`,
      (error, row) => {
        if (error) res.status(500).send(error)
        else {
          if (row) res.status(200).json(JSON.parse(row.json))
          else res.status(200).send("")
        }
      }
    )
  })
}