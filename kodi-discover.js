'use strict';
const arp = require('node-arp');
const mdns = require('mdns-js');
mdns.excludeInterface('0.0.0.0');

let mdnsReady = false;
let discoveredKodies = {};
let interval;
let INTERVAL_DISCOVERY = 60000; //1Min
let browser;



function kodiDB() {
	console.log ("Logging",discoveredKodies);
	let kodies = [];
	for ( let kodi in discoveredKodies){
		kodies.push({
			id: discoveredKodies[kodi].mac,
			name: discoveredKodies[kodi].name,
			reachable: discoveredKodies[kodi].reachable
		});
	}
	return kodies;
}

function initialise(){
	console.log ("Initialize Kodi")
	discover();
	interval = setInterval(discover, INTERVAL_DISCOVERY);
}

function discover() {
	console.log ("[SERVER]\tDiscovering KODI.");
	browser = '';
	browser = mdns.createBrowser('_xbmc-jsonrpc-h._tcp');
	browser.on('ready', function () {
		browser.discover();
	});
	
	browser.on('update', function (data) {
		addKodi(data);
		console.log ("MDNS UPDATE");
	});

}

function addKodi (discoveredData) {
	const ip = discoveredData.addresses[0];
	const reachable = true;	
	const port = discoveredData.port;
	const name = discoveredData.fullname.replace(/\._xbmc-jsonrpc-h\._tcp\.local/g, '');;

	getMacadress(ip).then(mac =>{
		discoveredKodies[mac] = {name, ip, port, mac, reachable};
		console.log ('Added/Updated Kodi to database with unique ID: '+discoveredData.fullname);
	});
}


function getKodi (mac){
	return discoveredKodies[mac];
}


function getMacadress(ip){
	return new Promise(function (fulfill, reject){
		arp.getMAC(ip, (err, mac) => {
			if (!err) {
				fulfill(mac);
			} else {
				fulfill('00:00:00:00:00:00');
			}
		});
	});
}

//discover();


module.exports = {
  kodiDB,
  discover,
	getKodi,
	initialise
};
