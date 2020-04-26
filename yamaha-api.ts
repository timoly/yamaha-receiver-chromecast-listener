import * as YamahaAPI from "yamaha-nodejs"
import got from "got"
import { config } from "./config"

const setDsp = async (ip, program) => {
  return got(`http://${ip}/YamahaExtendedControl/v1/main/setSoundProgram?program=${program}`)
}

const connectToYamaha = async() => {
  console.log(`connecting to yamaha receiver`)
  return new Promise<{ip: string, yamaha: any}>(async (resolve, _reject) => {
    try{
      const yamaha = new YamahaAPI()
      const ip = await yamaha.getOrDiscoverIP()
      console.log(`yamaha ip ${ip}`)
      resolve({ip, yamaha})
    }
    catch(error){
      console.error("yamaha connect error", error)
      setTimeout(connectToYamaha, 5000)
    }
  })
}


let yamahaStatusIntervalId = null
const stopChromecastPlaybackOnYamahaInputChange = (yamaha: any, ip: string, stopChromecastPlayback: () => Promise<void>) => {
  clearInterval(yamahaStatusIntervalId)
  yamahaStatusIntervalId = setInterval(() => {
    yamaha.getBasicInfo()
    .then(basicInfo => {
      const input = basicInfo.getCurrentInput()
      if(input !== config.yamahaSettings.music.input){
        clearInterval(yamahaStatusIntervalId)
        console.log(`yamaha input changed to ${input}, stopping chromecast`)
        stopChromecastPlayback()
        return setDsp(ip, config.yamahaSettings.music.program)
      }
    })
    .catch(error => {
      console.error("error getting yamaha basic settings", error)
    })
  }, 5000)
}

export const setupReceiverForMusicPlayback = async (stopChromecastPlayback: () => Promise<void>) => {
  const {yamaha, ip} = await connectToYamaha()
  await yamaha.powerOn()
  await yamaha.setMainInputTo(config.yamahaSettings.music.input)
  await yamaha.muteOff()
  await yamaha.setVolume("-420")
  await setDsp(ip, config.yamahaSettings.music.program)

  console.log("yamaha ready for music playback")

  stopChromecastPlaybackOnYamahaInputChange(yamaha, ip, stopChromecastPlayback)  
}