
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
    ip: "192.168.1.102",
    music: {
      program: "7ch_stereo",
      input: "hdmi1",
      volume: 71
    },
    tv: {
      program: "standard",
      input: "av4",
      volume: 91
    }
  }
}