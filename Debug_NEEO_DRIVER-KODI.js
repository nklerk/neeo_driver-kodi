'use strict';

const neeoapi = require('neeo-sdk');
const driver = require('./devices/kodi/index');

const test = driver.buildKodiDriver();

neeoapi.startServer({
      brain: '10.2.1.64',
      port: 63361,
      name: 'kodi-adapter-one',
      devices: [test]
  })
  .then(() => {
    console.log('# READY! use the NEEO app to search for "KODI IP Driver".');
  })
  .catch((err) => {
    console.error('ERROR!', err);
    process.exit(1);
  });




function buildKodiDriver (){
  let kodiDriver = neeoapi.buildDevice('IP Driver');
  kodiDriver.setManufacturer('KODI');
  kodiDriver.addAdditionalSearchToken('XBMC');
  kodiDriver.setType('MEDIAPLAYER');
  kodiDriver.addDirectory({ name: 'MOVIE LIBRARY', label: 'MOVIE LIBRARY' }, controller.movieLibrary);
  kodiDriver.addDirectory({ name: 'MUSIC LIBRARY', label: 'MUSIC LIBRARY' }, controller.musicLibrary);
  kodiDriver.addDirectory({ name: 'TV SHOW LIBRARY', label: 'TV SHOW LIBRARY' }, controller.tvshowLibrary);
  kodiDriver.addDirectory({ name: 'PVR LIBRARY', label: 'PVR LIBRARY' }, controller.pvrLibrary);
  Object.keys(commands.neeoCommands()).forEach((key) => {
    kodiDriver.addButton({ name: key, label: key });
  });
  kodiDriver.addButtonHander(controller.onButtonPressed);
  kodiDriver.enableDiscovery(DISCOVERY_INSTRUCTIONS, controller.discoverDevices)
  kodiDriver.registerSubscriptionFunction(controller.registerStateUpdateCallback)
  kodiDriver.registerInitialiseFunction(controller.initialise);
  return kodiDriver
}


