'use strict';

//const kodi = require('./kodi-tcp');
const neeoapi = require('neeo-sdk');
const controller = require('./controller');
const commands = require('./commands');

const DISCOVERY_INSTRUCTIONS = {
  headerText: 'Discover Kodi',
  description: 'NEEO will discover Kodi. Make sure to enable: "Announce services to other systems", "Allow remote control via HTTP" and "Allow remote control from applications on other systems". Pres Next to continue.'
};

console.log('NEEO SDK Kodi Driver');
console.log('---------------------------------------------');


// first we set the device info, used to identify it on the Brain


console.log('- discover one NEEO Brain...');
neeoapi.discoverOneBrain()
  .then((brain) => {
    console.log('- Brain discovered:', brain.name);
    console.log('- NEEO-SDK Start server');
    

    const kodiDriver = buildKodiDriver();
    
    return neeoapi.startServer({
      brain: "10.2.1.64",
      port: 63361,
      name: 'kodi-adapter-one',
      devices: [kodiDriver]
    });
  })
  .then(() => {
    console.log('# READY! use the NEEO app to search for "KODI Mediaplayer remote".');
  })
  .catch((err) => {
    console.error('ERROR!', err);
    process.exit(1);
  });




function buildKodiDriver (){
  let kodiDriver = neeoapi.buildDevice('Mediaplayer');
  kodiDriver.setManufacturer('KODI');
  kodiDriver.addAdditionalSearchToken('XBMC');
  kodiDriver.setType('MEDIAPLAYER');
  kodiDriver.addDirectory({ name: 'LIBRARY', label: 'Library' }, controller.browse);
  Object.keys(commands.neeoCommands()).forEach((key) => {
    kodiDriver.addButton({ name: key, label: key });
  });
  kodiDriver.addButtonHander(controller.onButtonPressed);
  kodiDriver.enableDiscovery(DISCOVERY_INSTRUCTIONS, controller.discoverDevices)
  kodiDriver.registerSubscriptionFunction(controller.registerStateUpdateCallback)
  kodiDriver.registerInitialiseFunction(controller.initialise);
  return kodiDriver
}


