'use strict';

const commands = require('./commands');
const browserServiceMovies = require('./kodi-browserService-movies');
const browserServiceMusic = require('./kodi-browserService-music');
const browserServiceTVShow = require('./kodi-browserService-tvshow');
const browserServicePVR = require('./kodi-browserService-pvr');
const kodiController = require('./kodi-controller');
const wol = require ('./wol');


function onButtonPressed(name, deviceid) {
  let kodiParams = kodiController.getKodi(deviceid);
  console.log ("Button pressed:", deviceid, name)
  if (name == "POWER ON") {
    let kodiip = kodiParams.ip || "255.255.255.255";
    wol.powerOnKodi(deviceid, kodiip);
  } else {
    let cmd = commands.neeoCommands()[name];
    kodiController.sendCommand(kodiParams, cmd.method, JSON.stringify(cmd.params));
  }
};

// Movies
function movieLibraryGetter(deviceId, params) {
  return browserServiceMovies.browse(deviceId, params)
}

function movieLibraryAction(deviceId, params) {
  let kodiParams = kodiController.getKodi(deviceId);
  browserServiceMovies.action(kodiParams, params.actionIdentifier)
}

//Musiv
function musicLibraryGetter(deviceId, params) {
  let kodiParams = kodiController.getKodi(deviceId);
  return browserServiceMusic.browse(kodiParams, params)
}

function musicLibraryAction(deviceId, params) {
  let kodiParams = kodiController.getKodi(deviceId);
  browserServiceMusic.startMovie(kodiParams, params.actionIdentifier)
}

//TV Show
function tvshowLibraryGetter(deviceId, params) {
  let kodiParams = kodiController.getKodi(deviceId);
  return browserServiceTVShow.browse(kodiParams, params)
}

function tvshowLibraryAction(deviceId, params) {
  let kodiParams = kodiController.getKodi(deviceId);
  browserServiceTVShow.startMovie(kodiParams, params.actionIdentifier)
}

// TV
function pvrLibraryGetter(deviceId, params) {
  let kodiParams = kodiController.getKodi(deviceId);
  return browserServicePVR.browse(kodiParams, params)
}

function pvrLibraryAction(deviceId, params) {
  let kodiParams = kodiController.getKodi(deviceId);
  browserServicePVR.startMovie(kodiParams, params.actionIdentifier)
}

//Discovery
function discoverDevices() {
  return kodiController.discovered();
}

function registerStateUpdateCallback() {
  // not in use //
}

function initialise() {
  kodiController.initialise();
}

module.exports = {
  onButtonPressed,
  movieLibrary: {
    getter: movieLibraryGetter,
    action: movieLibraryAction,
  },
  musicLibrary: {
    getter: musicLibraryGetter,
    action: musicLibraryAction,
  },
  tvshowLibrary: {
    getter: tvshowLibraryGetter,
    action: tvshowLibraryAction,
  },
  pvrLibrary: {
    getter: pvrLibraryGetter,
    action: pvrLibraryAction,
  },
  discoverDevices,
  registerStateUpdateCallback,
  initialise
};