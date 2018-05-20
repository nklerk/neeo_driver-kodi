'use strict';
const wol = require('node-wol');
const kodiController = require('./kodi-controller');

function powerOnKodi(deviceId, kodiip){

  // Wake on MAC and IP type 7
  wol.wake(deviceId, {address : kodiip, port : 7}, ()=>{ 
    console.log (`Wake on ${deviceId} and ${kodiip} type 7 Send`);
   });
  // Wake on MAC and IP type 9
  wol.wake(deviceId, {address : kodiip, port : 9}, ()=>{ 
    console.log (`Wake on ${deviceId} and ${kodiip} type 9 Send`);
   });
  // Wake on MAC and broadcast type 7
  wol.wake(deviceId, {address : '255.255.255.255', port : 7}, ()=>{  
    console.log (`Wake on ${deviceId} and 255.255.255.255 type 7 Send`);
  });
  // Wake on MAC and broadcast type 9
  wol.wake(deviceId, {address : '255.255.255.255', port : 9}, ()=>{  
    console.log (`Wake on ${deviceId} and 255.255.255.255 type 9 Send`);
  });
}

module.exports = {
  powerOnKodi
};