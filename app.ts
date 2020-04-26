require("log-timestamp")

import { chromecastConnect } from "./chromecast-api"

process.on("uncaughtException", function (err) {
  console.log("uncaughtException", err)
  process.exit(1)
})

chromecastConnect()