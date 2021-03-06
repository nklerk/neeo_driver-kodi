"use strict";

const commands = require("./kodi-commands");
const browserService = require("./kodi-browserService");
const kodiController = require("./kodi-controller");

function onButtonPressed(name, deviceId) {
  console.log("Button pressed:", deviceId, name);
  const cmd = commands.neeoCommands()[name];
  if (cmd.cac) {
    kodiController.sendContentAwareCommand(deviceId, cmd.method, cmd.params);
  } else {
    kodiController.sendCommand(deviceId, cmd.method, cmd.params);
  }
}

//root

function libraryGetter(deviceId, params) {
  return browserService.browse(deviceId, params);
}
function libraryAction(deviceId, params) {
  browserService.action(deviceId, params.actionIdentifier);
}

// Movies
function movieLibraryGetter(deviceId, params) {
  params.browseIdentifier = params.browseIdentifier || ".Movies";
  return browserService.browse(deviceId, params);
}
function movieLibraryAction(deviceId, params) {
  browserService.action(deviceId, params.actionIdentifier);
}

//Music
function musicLibraryGetter(deviceId, params) {
  params.browseIdentifier = params.browseIdentifier || ".Music";
  return browserService.browse(deviceId, params);
}
function musicLibraryAction(deviceId, params) {
  browserService.action(deviceId, params.actionIdentifier);
}

//TV Show
function tvshowLibraryGetter(deviceId, params) {
  params.browseIdentifier = params.browseIdentifier || ".TVShows";
  return browserService.browse(deviceId, params);
}
function tvshowLibraryAction(deviceId, params) {
  browserService.action(deviceId, params.actionIdentifier);
}

// TV
function pvrLibraryGetter(deviceId, params) {
  params.browseIdentifier = params.browseIdentifier || ".PVR";
  return browserService.browse(deviceId, params);
}
function pvrLibraryAction(deviceId, params) {
  browserService.action(deviceId, params.actionIdentifier);
}

function queueGetter(deviceId, params) {
  params.browseIdentifier = params.browseIdentifier || ".QUEUE";
  return browserService.browse(deviceId, params);
}
function queueAction(deviceId, params) {
  browserService.action(deviceId, params.actionIdentifier);
}

//Discovery
function discoverDevices() {
  return kodiController.discovered();
}

//Inform state changes
function registerStateUpdateCallback(updateFunction) {
  kodiController.SendComponentUpdate(updateFunction);
}

//init.
function initialise() {
  kodiController.initialise();
}

//Password thingy...
function addDeviceDiscoveryPassword(pass) {
  return kodiController.addDeviceDiscoveryPassword(pass);
}

function volumeGet(deviceId) {
  return kodiController.getVolume(deviceId);
}

function volumeSet(deviceId, value) {
  kodiController.setVolume(deviceId, value);
  return true; // add code.
}

function nowPlayingLabel(deviceId) {
  return kodiController.getNowPlayingLabel(deviceId);
}

function nowPlayingDescription(deviceId) {
  return kodiController.getNowPlayingDescription(deviceId);
}

function nowPlayingImg(deviceId) {
  return kodiController.getNowPlayingImg(deviceId);
}

function playSwitchGetter(deviceId) {
  return kodiController.getNowPlaying(deviceId);
}
function playSwitchSetter(deviceId, value) {
  console.log("playSwitchSetter", deviceId, value);
  if (value) {
    kodiController.sendCommand(deviceId, "Input.ExecuteAction", { action: "play" });
  } else {
    kodiController.sendCommand(deviceId, "Input.ExecuteAction", { action: "pause" });
  }
}

function muteSwitchGetter(deviceId) {
  return false;
}
function muteSwitchSetter(deviceId, value) {
  console.log("muteSwitchSetter", deviceId, value);
}

function shuffleSwitchGetter(deviceId) {
  return false;
}
function shuffleSwitchSetter(deviceId, value) {
  console.log("shuffleSwitchSetter", deviceId, value);
}

function repeatSwitchGetter(deviceId) {
  return false;
}
function repeatSwitchSetter(deviceId, value) {
  console.log("repeatSwitchSetter", deviceId, value);
}

module.exports = {
  onButtonPressed,
  volume: {
    get: volumeGet,
    set: volumeSet
  },
  playSwitch: {
    getter: playSwitchGetter,
    setter: playSwitchSetter
  },
  muteSwitch: {
    getter: muteSwitchGetter,
    setter: muteSwitchSetter
  },
  shuffleSwitch: {
    getter: shuffleSwitchGetter,
    setter: shuffleSwitchSetter
  },
  repeatSwitch: {
    getter: repeatSwitchGetter,
    setter: repeatSwitchSetter
  },
  coverArtSensor: {
    getter: nowPlayingImg,
    setter: nowPlayingImg
  },
  titleSensor: {
    getter: nowPlayingLabel,
    setter: nowPlayingLabel
  },
  descriptionSensor: {
    getter: nowPlayingDescription,
    setter: nowPlayingDescription
  },
  nowPlayingLabel,
  nowPlayingImg,
  library: {
    getter: libraryGetter,
    action: libraryAction
  },
  queue: {
    getter: queueGetter,
    action: queueAction
  },
  movieLibrary: {
    getter: movieLibraryGetter,
    action: movieLibraryAction
  },
  musicLibrary: {
    getter: musicLibraryGetter,
    action: musicLibraryAction
  },
  tvshowLibrary: {
    getter: tvshowLibraryGetter,
    action: tvshowLibraryAction
  },
  pvrLibrary: {
    getter: pvrLibraryGetter,
    action: pvrLibraryAction
  },
  discoverDevices,
  addDeviceDiscoveryPassword,
  registerStateUpdateCallback,
  initialise
};
