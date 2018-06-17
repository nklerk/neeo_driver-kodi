'use strict';
const wol = require('node-wol');

function powerOnKodi(deviceId, kodiip) {

  console.log(`Wake ${deviceId}`);
  // Wake on MAC and IP type 7
  wol.wake(deviceId, { address: kodiip, port: 7 }, () => { });
  // Wake on MAC and IP type 9
  wol.wake(deviceId, { address: kodiip, port: 9 }, () => { });
  // Wake on MAC and broadcast type 7
  wol.wake(deviceId, { address: '255.255.255.255', port: 7 }, () => { });
  // Wake on MAC and broadcast type 9
  wol.wake(deviceId, { address: '255.255.255.255', port: 9 }, () => { });
}

module.exports = {
  powerOnKodi
};