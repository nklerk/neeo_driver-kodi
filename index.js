'use strict';
/*
* Edit the folowing setting.
* 
*/

const kodi_ip = '10.2.1.28';
const kodi_port = 8080;
const kodi_login = 'kodi';
const kodi_password = '';


/*
* Driver:
* 
*/
const kodi = require('kodi-jsonrpc-http-post');
const neeoapi = require('neeo-sdk');
const controller = require('./controller');
console.log('NEEO SDK Kodi Driver');
console.log('---------------------------------------------');

/*
* Adapter - an Adapter contains one or more DEVICES. In this case we only use a single very
* simple 2 button device.
*/

// first we set the device info, used to identify it on the Brain
const customLightDevice = neeoapi.buildDevice('Mediaplayer remote')
  .setManufacturer('KODI')
  .addAdditionalSearchToken('foo')
  .setType('MEDIAPLAYER')

  // Then we add the capabilities of the device
    .addButton({ name: 'POWER OFF', label: 'POWER OFF' })
    .addButton({ name: 'POWER ON', label: 'POWER ON' })
    .addButton({ name: 'POWER TOGGLE', label: 'POWER TOGGLE' })
    .addButton({ name: 'PLAY', label: 'PLAY' })
    .addButton({ name: 'PAUSE', label: 'PAUSE' })
    .addButton({ name: 'STOP', label: 'STOP' })
    .addButton({ name: 'SKIP BACKWARD', label: 'SKIP BACKWARD' })
    .addButton({ name: 'SKIP FORWARD', label: 'SKIP FORWARD' })
    .addButton({ name: 'FORWARD', label: 'FORWARD' })
    .addButton({ name: 'PREVIOUS', label: 'PREVIOUS' })
    .addButton({ name: 'NEXT', label: 'NEXT' })
    .addButton({ name: 'REVERSE', label: 'REVERSE' })
    .addButton({ name: 'PLAY PAUSE TOGGLE', label: 'PLAY PAUSE TOGGLE' })
    .addButton({ name: 'INFO', label: 'INFO' })
    .addButton({ name: 'CHANNEL UP', label: 'CHANNEL UP' })
    .addButton({ name: 'CHANNEL DOWN', label: 'CHANNEL DOWN' })
    .addButton({ name: 'CHANNEL SEARCH', label: 'CHANNEL SEARCH' })
    .addButton({ name: 'FAVORITE', label: 'FAVORITE' })
    .addButton({ name: 'DIGIT 0', label: 'DIGIT 0' })
    .addButton({ name: 'DIGIT 1', label: 'DIGIT 1' })
    .addButton({ name: 'DIGIT 2', label: 'DIGIT 2' })
    .addButton({ name: 'DIGIT 3', label: 'DIGIT 3' })
    .addButton({ name: 'DIGIT 4', label: 'DIGIT 4' })
    .addButton({ name: 'DIGIT 5', label: 'DIGIT 5' })
    .addButton({ name: 'DIGIT 6', label: 'DIGIT 6' })
    .addButton({ name: 'DIGIT 7', label: 'DIGIT 7' })
    .addButton({ name: 'DIGIT 8', label: 'DIGIT 8' })
    .addButton({ name: 'DIGIT 9', label: 'DIGIT 9' })
    .addButton({ name: 'DIGIT SEPARATOR', label: 'DIGIT SEPARATOR' })
    .addButton({ name: 'BACK', label: 'BACK' })
    .addButton({ name: 'CURSOR DOWN', label: 'CURSOR DOWN' })
    .addButton({ name: 'CURSOR LEFT', label: 'CURSOR LEFT' })
    .addButton({ name: 'CURSOR RIGHT', label: 'CURSOR RIGHT' })
    .addButton({ name: 'CURSOR UP', label: 'CURSOR UP' })
    .addButton({ name: 'ENTER', label: 'ENTER' })
    .addButton({ name: 'EXIT', label: 'EXIT' })
    .addButton({ name: 'HOME', label: 'HOME' })
    .addButton({ name: 'MENU', label: 'MENU' })
    .addButton({ name: 'VOLUME UP', label: 'VOLUME UP' })
    .addButton({ name: 'VOLUME DOWN', label: 'VOLUME DOWN' })
    .addButton({ name: 'MUTE TOGGLE', label: 'MUTE TOGGLE' })
  .addButtonHander(controller.onButtonPressed);

console.log('- discover one NEEO Brain...');
neeoapi.discoverOneBrain()
  .then((brain) => {
    console.log('- Brain discovered:', brain.name);

    // Init kodi settings:
    kodi.init(kodi_ip,kodi_port,kodi_login,kodi_password).then(() => {
      console.log("- Kodi - Init complete");
    }).catch((err) => {
      console.error('ERROR!', err);
    });

    console.log('- NEEO-SDK Start server');
    return neeoapi.startServer({
      brain,
      port: 6336,
      name: 'simple-adapter-one',
      devices: [customLightDevice]
    });
  })
  .then(() => {
    console.log('# READY! use the NEEO app to search for "KODI Mediaplayer remote".');
  })
  .catch((err) => {
    console.error('ERROR!', err);
    process.exit(1);
  });