'use strict';
const arp = require('node-arp');
const mdns = require('mdns-js');
const kodirpc = require('./kodi-rpc');
mdns.excludeInterface('0.0.0.0');

let lastDiscovery;
let kodiDB = {};
let mdnsBrowser;

function discovered() {
	console.log ("kodiDB: Start");
	discover();
	return new Promise(function(resolve, reject) { 
		setTimeout(() => {
				console.log('kodiDB: Complete');
				let kodi = [];
				for ( let devideId in kodiDB){
					kodi.push({
						id: kodiDB[devideId].mac,
						name: kodiDB[devideId].name,
						reachable: kodiDB[devideId].reachable
					});
				}
				resolve(kodi);
		}, 8000)
	});
} 

function initialise(){
	console.log ("Initialize Kodi");
	discover();
}

function discover() {
	if (!lastDiscovery || (Date.now() - lastDiscovery > 2000)){
		lastDiscovery = Date.now()
		console.log ("[SERVER]\tDiscovering KODI(s).");
		mdnsBrowser = mdns.createBrowser('_xbmc-jsonrpc-h._tcp');
		mdnsBrowser.on('ready', function () {
			mdnsBrowser.discover();
			console.log ("MDNS: Discovering");
		});
	
		mdnsBrowser.on('update', function (data) {
			addKoditoDB(data);
			console.log ("MDNS: Found Kodi");
		});
	
		setTimeout(() => {
			mdnsBrowser.stop();
			console.log ("MDNS: Stopped");
		}, 2000);
	}
}

function addKoditoDB (discoveredData) {
	const ip = discoveredData.addresses[0];
	const reachable = true;	
	const port = discoveredData.port;
	const name = discoveredData.fullname.replace(/\._xbmc-jsonrpc-h\._tcp\.local/g, '');;
	const rpc = kodirpc.build(ip,port);
	const library = {movies:{}, recentmovies:{}, tvshows:{}, recentepisodes:{}, musicvideos:{}, musicalbums:{}, musictracks:{}, tvchannels:{}, radiochannels:{}, recordings:{}}
	getMacadress(ip).then(mac =>{
		kodiDB[mac] = {name, ip, port, mac, reachable, rpc, library};
		console.log ('Added/Updated Kodi "'+ name +'" to database with unique ID: '+mac);
	});
}

function getKodi (deviceId){
	if (kodiReady(deviceId)){
		return kodiDB[deviceId];
	} else {
		return false;
	}
	
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

function kodiReady(deviceID){
	if (kodiDB[deviceID] && kodiDB[deviceID].reachable){
		return true;
	} else {
		return false;
	}
}

//
function getRecentlyAddedMovies(deviceId){
	if (kodiReady(deviceId)){
		return kodiDB[deviceId].rpc.videolibrary.getRecentlyAddedMovies({"limits": { "start" : 0, "end": 30 }}).then((x)=>{
			kodiDB[deviceId].library.recentmovies = x.movies;
			return x.movies;
		});
	} else {
		return {}
	}
}

function getMovies(deviceId){
	if (kodiReady(deviceId)){
		return kodiDB[deviceId].rpc.videolibrary.getMovies({"sort": {"order": "ascending", "method": "title"}}).then((x)=>{
			kodiDB[deviceId].library.mocies = x.movies;
			return x.movies;
		});
	} else {
		return {}
	}
}

function playerOpen(deviceId,object){
	if (kodiReady(deviceId)){
		kodiDB[deviceId].rpc.player.open({item:{object}});
	}
}

function sendCommand (deviceId,method,params){
  kodiDB[deviceId].rpc.rpc(method, params);
}

module.exports = {
  discovered,
  discover,
	getKodi,
	initialise,
	library:{
		getRecentlyAddedMovies,
		getMovies,
		playerOpen
	},
	kodiReady,
	sendCommand
};
