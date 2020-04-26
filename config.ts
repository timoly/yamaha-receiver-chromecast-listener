

export const config = {
  // , "Living room and Bedroom speakers", "Living room and Bathroom speakers", "All speakers"
  targetSpeakers: ["Living room"],
  // get http://{yamaha ip}/YamahaExtendedControl/v1/main/getSoundProgramList
  yamahaSettings: {
    music: {
      program: "7ch_stereo",
      input: "HDMI1"
    },
    tv: {
      program: "standard",
      input: "AV4"
    }
  }
}