const net = require('net');
const kodiDiscover = require('./kodi-discover');
const TCPPORT = 9090;
let kodiClient = [];

function kodiConnect(ipString) {
    kodiClient[ipString] = new net.Socket();
    kodiClient[ipString].connect(TCPPORT, ipString, function() {
        console.log('Connected to ', ipString, ':',TCPPORT);
        //client.write('Hello, server! Love, Client.');
    });
    
    kodiClient[ipString].on('data', function(data) {
        ClientData(ipString, data)
    });

    kodiClient[ipString].on('close', function() {
        console.log('Connection closed');
    });

    kodiClient[ipString].on('error', function() {
        console.log('Connection error');
    });
}
module.exports.connect = kodiConnect;

function ClientData(ipString, data){
    console.log('Received data from ' + ipString + ': ' + data);
    console.log('');
    const json = JSON.parse(data);
}