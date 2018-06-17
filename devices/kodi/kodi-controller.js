'use strict';
const arp = require('node-arp');
const mdns = require('mdns-js');
const kodirpc = require('./kodi-rpc');
const images = require('./images');
const wol = require('./wol');
const request = require('request');
const tools = require('./tools');
//const kodiEvents = require('./kodi-events');
const kodiConnector = require('./KodiConnector/index');

mdns.excludeInterface('0.0.0.0');

let lastDiscovery;
let kodiDB = {};
let mdnsBrowser;
let addDevicePassword = '';

const COMMAND_QUEUE_INTERVAL = 3000;					//Interval for queueing Power On and Power Off commands.
const COMMAND_QUEUE_TIMEOUTLONG = 300000;			//Maximum time for polling initial connection after WOL.
const COMMAND_QUEUE_TIMEOUTSHORT = 6000; 			//Maximum time for polling shutdown command. (only used when driver is booted, KODI is on and first command send is Power Off.).
const CONNECTED_BANNER_TIME = 10000;					//Time length the NEEO Logo and connection banner is shown in KODI.
const MDNS_TIMEOUT = 2000;										//Duration per MDNS Discovery scan, after the timer the discovery gets cleaned and avoids memory leaks.
const NEEO_DRIVER_SEARCH_DELAY = 8000;				//Delay before responding on a discovery request. this gives the driver the time to discover, get mac, build RPC etc..
const PING_INTERVAL = 5000;										//Interval used to test online status of KODI.
const PING_TIMEOUT = 1000;										//The time KODI has to respond on a application PING request, on a timeout, the KODI instance is marked as unavaileble.
const MAC_INTERVAL = 500;

module.exports = {
	discovered,
	discover,
	getKodi,
	initialise,
	addDeviceDiscoveryPassword,
	library: {
		getRecentlyAddedMovies,
		getMovies,
		getTVShows,
		getRecentEpisodes,
		getTVshowEpisodes,
		getAlbums,
		getLatestAlbums,
		getAlbumTracks,
		getMusicVideos,
		getPvrRadioChannels,
		getPvrTvChannels,
		getPvrRecordings,
		playerOpen
	},
	kodiReady,
	sendCommand,
	sendContentAwareCommand
};

discover();


function addDeviceDiscoveryPassword(pass) {
	console.log('Passord used:', pass);
	addDevicePassword = pass
	return true;
}
//Pinging Application to check wether the instance is availeble.
function ping(deviceId) {
	if (kodiReady(deviceId)) {
		let kodi = getKodi(deviceId);
		request.get(`http://${kodi.username}:${kodi.password}@${kodi.ip}:${kodi.port}/jsonrpc?request=%7B%22jsonrpc%22%3A%222.0%22%2C%22method%22%3A%22JSONRPC.Ping%22%2C%22params%22%3A%7B%7D%2C%22id%22%3A%22NEEOPING%22%7D`, { timeout: 1000 }, function (err) {
			if (err !== null) {
				disconnected(deviceId, err);
			}
		});
	}
}


//This is called by neeo when searching for a kodi driver.
function discovered() {
	console.log("Discovered devices requested by NEEO.");
	discover();
	return new Promise(function (resolve, reject) {
		setTimeout(() => {
			console.log('Responding discovered devices to NEEO.');
			let kodi = [];
			for (let devideId in kodiDB) {
				kodi.push({
					id: kodiDB[devideId].mac,
					name: kodiDB[devideId].name,
					reachable: kodiDB[devideId].reachable
				});
			}
			resolve(kodi);
		}, NEEO_DRIVER_SEARCH_DELAY)
	});
}

// Init driver.
function initialise() {
	console.log("Initialize KODI Controller.");
	discover();
}



// Discover KODI instances.
function discover() {
	if (!lastDiscovery || (Date.now() - lastDiscovery > MDNS_TIMEOUT)) {
		lastDiscovery = Date.now()
		mdnsBrowser = mdns.createBrowser('_xbmc-jsonrpc-h._tcp');

		mdnsBrowser.on('ready', function () {
			console.log("MDNS:  Start");
			mdnsBrowser.discover();
		});

		mdnsBrowser.on('update', function (data) {
			addKoditoDB(data);
			console.log("MDNS:  responce.");
		});

		setTimeout(() => {
			mdnsBrowser.stop();
			console.log("MDNS:  Stop");
		}, MDNS_TIMEOUT);
	}
}



//Add a found kodi to the database.
function addKoditoDB(discoveredData) {
	const ip = discoveredData.addresses[0];
	const port = discoveredData.port;
	const reachable = true;
	const name = discoveredData.fullname.replace(/\._xbmc-jsonrpc-h\._tcp\.local/g, '');;
	const username = 'kodi';	// Preparation for user pass setting.
	const password = 'kodi';  // Preperation for user pass setting.
	const rpc = kodirpc.build(ip, port, username, password);

	//const events = new kodiEvents(ip);

	getMacadress(rpc).then(mac => {
		console.log(`KODIdb:  Found KODI instance with IP:${ip}, PORT:${port},MAC:${mac}, NAME:${name}.`);
		const ws = new kodiConnector.rpcws(mac, ip);
		kodiDB[mac] = { name, ip, port, mac, reachable, username, password, ws };


		kodiDB[mac].ws.events.on('notification', x => {
			console.log('notification', x.host, x.mac, x.eventdata);
		});

		kodiDB[mac].ws.events.on('connected', x => {
			console.log('connect', x.mac);
			console.log(kodiDB[mac].ws.isConnected());
		})

		kodiDB[mac].ws.events.on('closed', x => {
			console.log('close', x.mac);
		})

		kodiDB[mac].ws.events.on('error', x => {
			//console.log ('error',x.mac);
		})

	});
}



function getKodi(deviceId) {
	if (kodiReady(deviceId)) {
		return kodiDB[deviceId];
	} else {
		return false;
	}
}



function getKodiIp(deviceId) {
	if (kodiDB[deviceId] && kodiDB[deviceId].ip) {
		return kodiDB[deviceId].ip;
	} else {
		return "255.255.255.255";
	}
}



function getMacadress(rpc, tries) {
	tries = tries || 0;
	return rpc.rpc("XBMC.GetInfoLabels", '{"labels":["Network.MacAddress"]}').then(r => {
		const mac = r.result["Network.MacAddress"];
		if (!tools.isProperMac(mac) && tries < 30) {
			return getMacadress(rpc, tries + 1);
		} else {
			return mac;
		}
	})
}



function kodiReady(deviceID) {
	if (kodiDB[deviceID] && kodiDB[deviceID].reachable) {
		return true;
	} else {
		discover();
		return false;
	}
}



//getRecentlyAddedMovies
function getRecentlyAddedMovies(deviceId, offset, limit) {
	if (kodiReady(deviceId)) {
		return kodiDB[deviceId].ws.send('VideoLibrary.GetRecentlyAddedMovies', { "properties": ["thumbnail", "playcount", "year", "genre"], "limits": { "start": 0, "end": 30 } });
	} else {
		return Promise.resolve({});
	}
}



function getMovies(deviceId, filter, offset, limit) {
	if (kodiReady(deviceId)) {
		const end = offset + limit;
		let queery = {};
		if (filter.field) {
			queery = { "properties": ["thumbnail", "playcount", "year", "genre"], filter, "sort": { "order": "ascending", "method": "title" }, "limits": { "start": offset, "end": end } }
		} else {
			queery = { "properties": ["thumbnail", "playcount", "year", "genre"], "sort": { "order": "ascending", "method": "title" }, "limits": { "start": offset, "end": end } }
		}
		//return kodiDB[deviceId].rpc.videolibrary.getMovies(queery);
		return kodiDB[deviceId].ws.send('VideoLibrary.GetMovies', queery);
	} else {
		return Promise.resolve({});
	}
}



function getRecentEpisodes(deviceId) {
	if (kodiReady(deviceId)) {
		return kodiDB[deviceId].ws.send('VideoLibrary.GetEpisodes', { "limits": { "start": 0, "end": 30 }, "sort": { "order": "descending", "method": "dateadded" } });
	} else {
		return Promise.resolve({});
	}
}



function getTVshowEpisodes(deviceId, showId, offset, limit) {
	if (kodiReady(deviceId)) {
		const end = offset + limit;
		return kodiDB[deviceId].ws.send('VideoLibrary.GetEpisodes', { "tvshowid": showId, "limits": { "start": offset, "end": end } });
	} else {
		return Promise.resolve({});
	}
}



function getTVShows(deviceId, offset, limit) {
	if (kodiReady(deviceId)) {
		const end = offset + limit;
		return kodiDB[deviceId].ws.send('VideoLibrary.GetTVShows', { "sort": { "order": "ascending", "method": "title" }, "limits": { "start": offset, "end": end } });
	} else {
		return Promise.resolve({});
	}
}



function getAlbums(deviceId, offset, limit) {
	if (kodiReady(deviceId)) {
		const end = offset + limit;
		return kodiDB[deviceId].ws.send('AudioLibrary.GetAlbums', { "properties": ["thumbnail", "artist", "albumlabel"], "sort": { "method": "title", "order": "ascending", "ignorearticle": true }, "limits": { "start": offset, "end": end } });
	} else {
		return Promise.resolve({});
	}
}



function getLatestAlbums(deviceId, offset, limit) {
	if (kodiReady(deviceId)) {
		const end = offset + limit;
		return kodiDB[deviceId].ws.send('AudioLibrary.GetRecentlyAddedAlbums', { "properties": ["thumbnail", "artist", "albumlabel"], "limits": { "start": offset, "end": end } });
	} else {
		return Promise.resolve({});
	}
}



function getAlbumTracks(deviceId, id, offset, limit) {
	if (kodiReady(deviceId)) {
		const end = offset + limit;
		return kodiDB[deviceId].ws.send('AudioLibrary.GetSongs', { "properties": ["title", "thumbnail", "artist", "album", "track"], "sort": { "method": "track", "order": "ascending", "ignorearticle": true }, "filter": { "albumid": id }, "limits": { "start": offset, "end": end } });
	} else {
		return Promise.resolve({});
	}
}



function getMusicVideos(deviceId, offset, limit) {
	if (kodiReady(deviceId)) {
		const end = offset + limit;
		return kodiDB[deviceId].ws.send('VideoLibrary.GetMusicVideos', { "properties": ["title", "thumbnail", "artist"], "sort": { "method": "track", "order": "ascending", "ignorearticle": true }, "limits": { "start": offset, "end": end } });
	} else {
		return Promise.resolve({});
	}
}



function getPvrRadioChannels(deviceId, offset, limit) {
	if (kodiReady(deviceId)) {
		const end = offset + limit;
		return kodiDB[deviceId].ws.send('PVR.GetChannels', { "channelgroupid": "allradio", "properties": ["thumbnail", "channeltype", "hidden", "locked", "channel", "broadcastnow"], "limits": { "start": offset, "end": end } });
	} else {
		return Promise.resolve({});
	}
}



function getPvrTvChannels(deviceId, offset, limit) {
	if (kodiReady(deviceId)) {
		const end = offset + limit;
		return kodiDB[deviceId].ws.send('PVR.GetChannels', { "channelgroupid": "alltv", "properties": ["thumbnail", "channeltype", "hidden", "locked", "channel", "broadcastnow"], "limits": { "start": offset, "end": end } });
	} else {
		return Promise.resolve({});
	}
}



function getPvrRecordings(deviceId) {
	if (kodiReady(deviceId)) {
		return kodiDB[deviceId].ws.send('PVR.GetRecordings', { "properties": ["title", "starttime", "endtime", "art"] });
	} else {
		return Promise.resolve({});
	}
}



function playerOpen(deviceId, object) {
	if (kodiReady(deviceId)) {
		kodiDB[deviceId].ws.send('Player.Open', { item: object }).catch((e) => {
			disconnected(deviceId, e);
		});
	}
}



function sendCommand(deviceId, method, params, timer) {
	if (kodiReady(deviceId)) {
		if (method == "System.Shutdown" && kodiDB[deviceId].ping) {
			clearInterval(kodiDB[deviceId].ping);
		}
		if (params == '{}') {
			kodiDB[deviceId].ws.send(method).catch((e) => {
				disconnected(deviceId, e);
			});
		} else {
			kodiDB[deviceId].ws.send(method, params).catch((e) => {
				disconnected(deviceId, e);
			});
		}

	} else {	//if kodi is not connected
		const time = timer || Date.now();
		if (method == "WOL") {
			wol.powerOnKodi(deviceId, getKodiIp(deviceId));
			if (Date.now() - time < COMMAND_QUEUE_TIMEOUTLONG) {
				setTimeout(() => {
					sendCommand(deviceId, method, params, time);
				}, COMMAND_QUEUE_INTERVAL);
			}
		}

		if (method == "System.Shutdown" && kodiDB[deviceId] && kodiDB[deviceId].ping) {
			clearInterval(kodiDB[deviceId].ping);
		}
	}
}



function sendContentAwareCommand(deviceId, method, params) {
	sendCommand(deviceId, method, params); //Is allways send, checked official kodi remote app.
	if (kodiReady(deviceId)) {
		if (method == 'Input.right' || method == 'Input.left' || method == 'Input.down' || method == 'Input.up' || method == 'Input.select' || method == 'Player.SetSpeed') {
			kodiDB[deviceId].ws.send('GUI.GetProperties', { "properties": ["currentwindow", "fullscreen"] }).then(window => {
				//console.log ('CAC window:', window);
				if (window.currentwindow.label == 'Fullscreen video') {
					kodiDB[deviceId].ws.send('XBMC.GetInfoBooleans', { "booleans": ["VideoPlayer.HasMenu", "Pvr.IsPlayingTv"] }).then(resp => {
						console.log('CAC HasMenu:', resp['VideoPlayer.HasMenu']);
						console.log('CAC IsPlayingTv:', resp[`Pvr.IsPlayingTv`]);
						if (resp[`Pvr.IsPlayingTv`]) {
							if (method == 'Player.SetSpeed' && params == '{"playerid":1,"speed":-2}') { sendCommand(deviceId, 'Input.ExecuteAction', '{ "action": "channeldown"}'); }
							if (method == 'Player.SetSpeed' && params == '{"playerid":1,"speed":2}') { sendCommand(deviceId, 'Input.ExecuteAction', '{ "action": "channelup"}'); }
						}
						if (!resp[`VideoPlayer.HasMenu`]) {
							if (method == 'Input.up') { sendCommand(deviceId, 'Player.Seek', '{"value":"bigforward","playerid":1}'); }
							if (method == 'Input.down') { sendCommand(deviceId, 'Player.Seek', '{"value":"bigbackward","playerid":1}'); }
							if (method == 'Input.left') { sendCommand(deviceId, 'Player.Seek', '{"value":"smallbackward","playerid":1}'); }
							if (method == 'Input.right') { sendCommand(deviceId, 'Player.Seek', '{"value":"smallforward","playerid":1}'); }
							if (method == 'Input.select') { sendCommand(deviceId, 'Input.ShowOSD', '{}'); }
						} //if (!resp.VideoPlayer.HasMenu){
					}) // RPC XBMC.GetInfoBooleans
				} // if (window.fullscreen)else do nothing
			}) // Get getProperties currentwindow
		}// if input Input.right ++
	}// If Kodi is ready
} // function



function conectedMessage(deviceId) {
	const message = {
		"title": "NEEO",
		"message": "The NEEO IP driver is connected",
		"image": images.logo_NEEO_Twitter,
		"displaytime": CONNECTED_BANNER_TIME
	}
	//console.log(`Send KODI notification ${message.message}.`)
	let x = kodiDB[deviceId].ws;
	kodiDB[deviceId].ws.send('GUI.ShowNotification', message).catch((e) => {
		disconnected(deviceId, e);
	});
}



function disconnected(deviceId, error) {
	console.log(`Got an error from KODI with ID "${deviceId}".`);
	console.log(error);
	console.log(`Marking KODI with ID "${deviceId}" as offline.`);
	clearInterval(kodiDB[deviceId].ping);
	kodiDB[deviceId].reachable = false;
}