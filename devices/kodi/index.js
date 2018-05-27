'use strict';

const neeoapi = require('neeo-sdk');
const controller = require('./controller');
const commands = require('./Commands/commands');

const DISCOVERY_INSTRUCTIONS = {
  headerText: 'Discover Kodi',
  description: 'NEEO will discover Kodi. Make sure to enable: "Announce services to other systems", "Allow remote control via HTTP" and "Allow remote control from applications on other systems". Pres Next to continue.'
};

const kodi = buildKodiDriver();

console.log ('Kodi Driver by Niels de Klerk.');



module.exports = {
  devices: [kodi],
  buildKodiDriver
}


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
