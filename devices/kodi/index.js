"use strict";

const neeoapi = require("neeo-sdk");
const controller = require("./controller");
const commands = require("./kodi-commands");

const DISCOVERY_INSTRUCTIONS = {
  headerText: "NEEO will discover Kodi.",
  description: 'Make sure to enable: "Announce services to other systems"\r\n"Allow remote control via HTTP" and\r\n"Allow remote control from applications on other systems".\r\n\r\nPres Next to continue.'
};

const SECURITY_CODE_INSTRUCTIONS = {
  type: "SECURITY_CODE",
  headerText: "Kodi Password",
  description: "Please enter the password you use with KODI"
};

const kodi = buildKodiDriver();
const kodiplayer = buildKodiPlayerDriver();

console.log("Kodi Driver by Niels de Klerk.");

module.exports = {
  devices: [kodi], //, kodiplayer
  buildKodiDriver,
  buildKodiPlayerDriver
};

function buildKodiDriver() {
  let kodiDriver = neeoapi.buildDevice("IP Driver");
  kodiDriver.setManufacturer("KODI");
  kodiDriver.addAdditionalSearchToken("XBMC");
  kodiDriver.setType("MEDIAPLAYER");
  kodiDriver.addDirectory({ name: "LIBRARY", label: "LIBRARY" }, controller.library);
  kodiDriver.addDirectory({ name: "MOVIE LIBRARY", label: "MOVIE LIBRARY" }, controller.movieLibrary);
  kodiDriver.addDirectory({ name: "MUSIC LIBRARY", label: "MUSIC LIBRARY" }, controller.musicLibrary);
  kodiDriver.addDirectory({ name: "TV SHOW LIBRARY", label: "TV SHOW LIBRARY" }, controller.tvshowLibrary);
  kodiDriver.addDirectory({ name: "PVR LIBRARY", label: "PVR LIBRARY" }, controller.pvrLibrary);
  Object.keys(commands.neeoCommands()).forEach(key => {
    kodiDriver.addButton({ name: key, label: key });
  });
  kodiDriver.addButtonHander(controller.onButtonPressed);
  kodiDriver.addSlider({ name: "VOLUMESLIDER", label: "VOLUME", range: [0, 100], unit: "%" }, { setter: controller.volume.set, getter: controller.volume.get });
  kodiDriver.addTextLabel({ name: "NOWPLAYINGTITLE", label: "Now Playing Title", isLabelVisible: false }, controller.titleSensor.getter);
  kodiDriver.addTextLabel({ name: "NOWPLAYINGDESCRIPTION", label: "Now Playing Description", isLabelVisible: false }, controller.descriptionSensor.getter);
  kodiDriver.addImageUrl({ name: "NOWPLAYINGIMAGE", label: "Now Playing Cover", size: "large" }, controller.coverArtSensor.getter);
  kodiDriver.enableDiscovery(DISCOVERY_INSTRUCTIONS, controller.discoverDevices);
  //kodiDriver.enableRegistration(SECURITY_CODE_INSTRUCTIONS, { register: controller.addDeviceDiscoveryPassword, isRegistered: () => {console.log('isRegistered')}  } )
  kodiDriver.registerSubscriptionFunction(controller.registerStateUpdateCallback);
  kodiDriver.registerInitialiseFunction(controller.initialise);
  return kodiDriver;
}

function buildKodiPlayerDriver() {
  let kodiPlayerDriver = neeoapi.buildDevice("IP Driver (Player)");
  kodiPlayerDriver.setManufacturer("KODI");
  kodiPlayerDriver.addAdditionalSearchToken("XBMC");
  kodiPlayerDriver.setType("MEDIAPLAYER");
  kodiPlayerDriver.addDirectory({ name: "PLAYER_ROOT_DIRECTORY", label: "ROOT", role: "ROOT" }, controller.library);
  kodiPlayerDriver.addDirectory({ name: "PLAYER_QUEUE_DIRECTORY", label: "QUEUE", role: "QUEUE" }, controller.library);
  kodiPlayerDriver.addDirectory({ name: "MOVIE LIBRARY", label: "MOVIE LIBRARY" }, controller.movieLibrary);
  kodiPlayerDriver.addDirectory({ name: "MUSIC LIBRARY", label: "MUSIC LIBRARY" }, controller.musicLibrary);
  kodiPlayerDriver.addDirectory({ name: "TV SHOW LIBRARY", label: "TV SHOW LIBRARY" }, controller.tvshowLibrary);
  kodiPlayerDriver.addDirectory({ name: "PVR LIBRARY", label: "PVR LIBRARY" }, controller.pvrLibrary);
  kodiPlayerDriver.addSwitch({ name: "PLAYING" }, controller.playSwitch);
  kodiPlayerDriver.addSwitch({ name: "MUTE" }, controller.muteSwitch);
  kodiPlayerDriver.addSwitch({ name: "SHUFFLE" }, controller.shuffleSwitch);
  kodiPlayerDriver.addSwitch({ name: "REPEAT" }, controller.repeatSwitch);
  Object.keys(commands.neeoCommands()).forEach(key => {
    kodiPlayerDriver.addButton({ name: key, label: key });
  });
  kodiPlayerDriver.addButtonHander(controller.onButtonPressed);
  kodiPlayerDriver.addSlider({ name: "VOLUME", label: "VOLUME", range: [0, 100], unit: "%" }, { setter: controller.volume.set, getter: controller.volume.get });
  kodiPlayerDriver.addSensor({ name: "COVER_ART_SENSOR", type: "string" }, controller.coverArtSensor);
  kodiPlayerDriver.addSensor({ name: "TITLE_SENSOR", type: "string" }, controller.titleSensor);
  kodiPlayerDriver.addSensor({ name: "DESCRIPTION_SENSOR", type: "string" }, controller.descriptionSensor);
  kodiPlayerDriver.enableDiscovery(DISCOVERY_INSTRUCTIONS, controller.discoverDevices);
  //kodiDriver.enableRegistration(SECURITY_CODE_INSTRUCTIONS, { register: controller.addDeviceDiscoveryPassword, isRegistered: () => {console.log('isRegistered')}  } )
  kodiPlayerDriver.registerSubscriptionFunction(controller.registerStateUpdateCallback);
  kodiPlayerDriver.registerInitialiseFunction(controller.initialise);
  return kodiPlayerDriver;
}
