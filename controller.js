//const kodi = require('kodi-jsonrpc-http-post');
const commands = require('./commands');
const BrowserService = require('./kodi-browserService-movies');
const kodiDiscover = require('./kodi-discover')
const wol = require('node-wol');

function onButtonPressed(name, deviceid) {
  let kodiParams = kodiDiscover.getKodi(deviceid);
  console.log ("Button pressed:", deviceid, name)
  if (name == "POWER ON") {
    powerOnKodi(deviceid);
  } else {
    let cmd = commands.neeoCommands()[name];
    BrowserService.sendCommand(kodiParams, cmd.method, JSON.stringify(cmd.params));
  }
};

function powerOnKodi(deviceid){
  let kodiParams = kodiDiscover.getKodi(deviceid);
  if (typeof kodiParams !== "undefined") {
    wol.wake(deviceid, {address : kodiParams.ip, port : 7}, (a)=>{
      console.log (a);
    });
  }
  wol.wake(deviceid, {address : '255.255.255.255', port : 9}, (a)=>{
    console.log (a);
  });
}

function getter(deviceId, params) {
  let kodiParams = kodiDiscover.getKodi(deviceId);
  return BrowserService.browse(kodiParams, params)
}

function action(deviceId, params) {
  let kodiParams = kodiDiscover.getKodi(deviceId);
  BrowserService.startMovie(kodiParams, params.actionIdentifier)
}

function discoverDevices() {
  return kodiDiscover.kodiDB();
}

function registerStateUpdateCallback() {

}

function initialise() {
  kodiDiscover.initialise();
}

module.exports = {
  onButtonPressed,
  browse: {
    getter,
    action,
  },
  discoverDevices,
  registerStateUpdateCallback,
  initialise
};