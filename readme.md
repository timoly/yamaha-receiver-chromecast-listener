# Yamaha <> Chromecast two-way integration

Quick project to act as a two-integration between supported Yamaha receiver and Google Chromecast.  
When spotify starts on a target chromecast device, receiver input & dsp program is set for music.  
When spotify stops receiver dsp setting is restored.  
When receiver input changes, spotify is stopped.  

## Usage
- setup config.ts values
- npm install
- pm2 start --name yamaha_cc_listener npm -- start

## Support
- The YamahaExtendedControl HTTP API works with 2016+ receivers that support MusicCast.