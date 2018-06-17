'use strict';
const net = require('net');

const DEFAULT_PORT = 9090;

const client = new net.Socket();

client.on('data', function (data) {
  console.log('EVENTS: Received: ' + data);
  //client.destroy(); // kill client after server's response
});

client.on('close', function () {
  console.log('EVENTS: Connection closed');
});

client.on('error', function (e) {
  console.log('EVENTS: Connection error', e);
});

client.on('listening', function () {
  console.log('EVENTS: Connection listening');
});

let kodiEvents = function (host, port) {
  port = port || DEFAULT_PORT
  client.connect(9090, '10.2.1.45', function () {
    console.log('EVENTS: Connected');
    //client.write('Hello, server! Love, Client.');
  });
  client.connect(9090, '10.2.1.45', function () {
    console.log('EVENTS: Connected');
    //client.write('Hello, server! Love, Client.');
  });
  client.connect(9090, '10.2.1.45', function () {
    console.log('EVENTS: Connected');
    //client.write('Hello, server! Love, Client.');
  });
  client.connect(9090, '10.2.1.45', function () {
    console.log('EVENTS: Connected');
    //client.write('Hello, server! Love, Client.');
  });
  client.connect(9090, '10.2.1.45', function () {
    console.log('EVENTS: Connected');
    //client.write('Hello, server! Love, Client.');
  });
  client.connect(9090, '10.2.1.45', function () {
    console.log('EVENTS: Connected');
    //client.write('Hello, server! Love, Client.');
  });
}






module.exports = kodiEvents;