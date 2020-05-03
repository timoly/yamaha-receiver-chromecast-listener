import got from "got"
import { config } from "./config"

const yamahaBaseUrl = `http://${config.yamahaSettings.ip}/YamahaExtendedControl/v1/main`

const yamahaCmd = async (path: string) => {
  const response = (await got(`${yamahaBaseUrl}/${path}`).json()) as {response_code?: number}
  if(response.response_code === 0){
    return response
  }
  throw new Error(`invalid yamaha response for ${path} ${response}`)
}


const setDsp = async (program) => yamahaCmd(`setSoundProgram?program=${program}`)
const setPowerOn = async () => yamahaCmd(`setPower?power=on`)
const setVolume = async (volume) => yamahaCmd(`setVolume?volume=${volume}`)
const setMainInputTo = async (input) => yamahaCmd(`setInput?input=${input}`)
const setMuteOff = async () => yamahaCmd(`setMute?enable=false`)
const getInput = async () => yamahaCmd(`getStatus`).then(response => (response as {input:string}).input)

let yamahaStatusIntervalId = null
const stopChromecastPlaybackOnYamahaInputChange = (stopChromecastPlayback: () => Promise<void>) => {
  clearInterval(yamahaStatusIntervalId)
  yamahaStatusIntervalId = setInterval(() => {
    getInput()
    .then(input => {
      if(input !== config.yamahaSettings.music.input){
        clearInterval(yamahaStatusIntervalId)
        console.log(`yamaha input changed to ${input}, stopping chromecast`)
        stopChromecastPlayback()
        return setDsp(config.yamahaSettings.music.program)
      }
    })
    .catch(error => {
      console.error("error getting yamaha basic settings", error)
    })
  }, 5000)
}

export const setupReceiverForMusicPlayback = async (stopChromecastPlayback: () => Promise<void>) => {
  console.log("setupReceiverForMusicPlayback")
  await setPowerOn()
  await setVolume(config.yamahaSettings.music.volume)
  await setMainInputTo(config.yamahaSettings.music.input)
  await setMuteOff()
  await setDsp(config.yamahaSettings.music.program)

  console.log("yamaha ready for music playback")

  stopChromecastPlaybackOnYamahaInputChange(stopChromecastPlayback)  
}

export const setupReceiverForTvPlayback = async () => {
  console.log("setupReceiverForTvPlayback")
  await setVolume(config.yamahaSettings.tv.volume)
  await setDsp(config.yamahaSettings.tv.program)
  console.log("yamaha ready for tv playback")
}