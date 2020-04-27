import {Client, DefaultMediaReceiver} from "castv2-client"
import * as mdns from "mdns-js"
import { setupReceiverForMusicPlayback, setupReceiverForTvPlayback } from "./yamaha-api"
import { config } from "./config"
import * as util from "util"

const parseTxt = items => items.reduce((acc, cur) => {
  const split = cur.split("=")
  return {...acc, [split[0]]: split[1]}
}, {})

export const chromecastConnect = () => {
  console.log("connecting...")

  var browser = mdns.createBrowser(mdns.tcp("googlecast"))
  browser.on("ready", () => {
    console.log("browser is ready");
    browser.discover();
  })
  
  browser.on("update", data => {
    const txt = parseTxt(data.txt || [])
    if(config.targetSpeakers.includes(txt.fn)){
      console.log("connecting to:", txt.fn)
      browser.stop()
      ondeviceup(data.addresses[0], data.port, txt.fn)
    }
  })
}

const getChromecastApi = (client: any, fn: any) => util.promisify(fn).bind(client)

const setVolume = (client: any, level: number) => getChromecastApi(client, client.setVolume)({level})
const getStatus = (client: any) => getChromecastApi(client, client.getStatus)()
const connect = (client: any, host: string, port: number) => getChromecastApi(client, client.connect)({host, port})

const stopPlayback = (client: any) => async () => {
  try{
    const getSessions = getChromecastApi(client, client.getSessions)
    const join = getChromecastApi(client, client.join)
    const stop = getChromecastApi(client, client.stop)

    const sessions = await getSessions()
    const app = await join(sessions[0], DefaultMediaReceiver)

    await stop(app)
  }
  catch(error){
    console.error("stop playback error", error)
  }
}

const ondeviceup = async (host, port, deviceName) => {
  let intervalId = null
  const client = new Client()

  const onError = (error) => {
    console.error("onError:", error, deviceName)
    clearInterval(intervalId)
    client.close()

    setTimeout(() => {
      chromecastConnect()
    }, 10000)
  }

  try{
    let isPlaying = false
    const onStatus = async (status) => {
      const applications = status?.applications || []
      const appId = applications[0]?.appId
      const isMusicApp = Object.keys(config.musicApps).includes(appId)
      // console.log(`onStatus ${deviceName} isMusicApp: ${isMusicApp} isPlaying: ${isPlaying}`)

      if(!isPlaying && isMusicApp){
        console.log(`started playing ${appId} device: ${deviceName}`)
        await setVolume(client, 1)
        await setupReceiverForMusicPlayback(stopPlayback(client))
        isPlaying = true
      }
      if(isPlaying && !isMusicApp){
        console.log("stopped playing", deviceName)
        await setupReceiverForTvPlayback()
        isPlaying = false
      }
    }

    await connect(client, host, port)
    console.log(`connected ${deviceName}`)

    intervalId = setInterval(() => getStatus(client).then(onStatus).catch(onError), 5000)
    
    // client.on("status", onStatus)
    client.on("error", onError)
  }
  catch(error){
    onError(error)
  }
}