"use strict";

const neeoapi = require("neeo-sdk");
const driver = require("./devices/kodi/index");

const kodiPlayer = driver.buildKodiPlayerDriver();
kodiPlayer.devicename = kodiPlayer.devicename + " -=Debug Mode=-";

neeoapi
  .startServer({
    brain: "10.2.1.64",
    port: 1338,
    name: "kodi-adapter",
    devices: [kodiPlayer] //kodi, kodiPlayer
  })
  .then(() => {
    console.log('# READY! use the NEEO app to search for "KODI IP Driver".');
  })
  .catch(err => {
    console.error("ERROR!", err);
    process.exit(1);
  });
