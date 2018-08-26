"use strict";

const neeoapi = require("neeo-sdk");
const driver = require("./devices/kodi/index");

const kodi = driver.buildKodiDriver();
kodi.devicename = kodi.devicename + " -=Debug Mode=-";

neeoapi
  .startServer({
    brain: "10.2.1.64",
    port: 1337,
    name: "kodi-adapter",
    devices: [kodi] //kodi, kodiPlayer
  })
  .then(() => {
    console.log('# READY! use the NEEO app to search for "KODI IP Driver".');
  })
  .catch(err => {
    console.error("ERROR!", err);
    process.exit(1);
  });
