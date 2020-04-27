
export const musicApps = {
  "CC32E753": "spotify",
  "CC1AD845": "default media receiver",
  "705D30C6": "default media receiver"
}

export const config = {
  musicApps,
  targetSpeakers: ["Living room"],
  // get http://{yamaha ip}/YamahaExtendedControl/v1/main/getSoundProgramList
  yamahaSettings: {
    music: {
      program: "7ch_stereo",
      input: "HDMI1",
      volume: "-450"
    },
    tv: {
      program: "standard",
      input: "AV4",
      volume: "-350"
    }
  }
}