'use strict';

const commands = require('./Commands/commands');
const browserServiceMovies = require('./BrowserService/kodi-browserService-movies');
const browserServiceMusic = require('./BrowserService/kodi-browserService-music');
const browserServiceTVShow = require('./BrowserService/kodi-browserService-tvshow');
const browserServicePVR = require('./BrowserService/kodi-browserService-pvr');
const kodiController = require('./kodi-controller');

function onButtonPressed(name, deviceid) {
  console.log('Button pressed:', deviceid, name);
  const cmd = commands.neeoCommands()[name];
  if (cmd.cac) {
    kodiController.sendContentAwareCommand(deviceid, cmd.method, JSON.stringify(cmd.params));
  } else {
    kodiController.sendCommand(deviceid, cmd.method, JSON.stringify(cmd.params));
  }
}

// Movies
function movieLibraryGetter(deviceId, params) {
  return browserServiceMovies.browse(deviceId, params);
}

function movieLibraryAction(deviceId, params) {
  browserServiceMovies.action(deviceId, params.actionIdentifier);
}

//Music
function musicLibraryGetter(deviceId, params) {
  return browserServiceMusic.browse(deviceId, params);
}

function musicLibraryAction(deviceId, params) {
  browserServiceMusic.action(deviceId, params.actionIdentifier);
}

//TV Show
function tvshowLibraryGetter(deviceId, params) {
  return browserServiceTVShow.browse(deviceId, params);
}

function tvshowLibraryAction(deviceId, params) {
  browserServiceTVShow.action(deviceId, params.actionIdentifier);
}

// TV
function pvrLibraryGetter(deviceId, params) {
  return browserServicePVR.browse(deviceId, params);
}

function pvrLibraryAction(deviceId, params) {
  browserServicePVR.action(deviceId, params.actionIdentifier);
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
  initialise,
};
