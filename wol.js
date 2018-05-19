'use strict';
const wol = require('node-wol');

function powerOnKodi(deviceid, kodiip){
  // Wake on MAC and IP type 7
  wol.wake(deviceid, {address : kodiip, port : 7}, (a)=>{  });
  // Wake on MAC and IP type 9
  wol.wake(deviceid, {address : kodiip, port : 9}, (a)=>{  });
  // Wake on MAC and broadcast type 7
  wol.wake(deviceid, {address : '255.255.255.255', port : 7}, (a)=>{  });
  // Wake on MAC and broadcast type 9
  wol.wake(deviceid, {address : '255.255.255.255', port : 9}, (a)=>{  });
}

module.exports = {
  powerOnKodi
};