"use strict";

const mdns = require("mdns-js");
const kodirpc = require("./kodi-rpc");
const images = require("./images");
const wol = require("./wol");
const tools = require("./tools");
const kodiConnector = require("./kodi-connector");

mdns.excludeInterface("0.0.0.0");

let lastDiscovery;
let kodiDB = {};
let mdnsBrowser;
let addDevicePassword = "";
let sendComponentUpdate;
let discoveryConnect = "";

function SendComponentUpdate(SCU) {
  sendComponentUpdate = SCU;
  console.log("Updater registered.");
}

const COMMAND_QUEUE_INTERVAL = 3000; //Interval for queueing Power On and Power Off commands.
const COMMAND_QUEUE_TIMEOUTLONG = 300000; //Maximum time for polling initial connection after WOL.
const CONNECTED_BANNER_TIME = 10000; //Time length the NEEO Logo and connection banner is shown in KODI.
const MDNS_TIMEOUT = 2000; //Duration per MDNS Discovery scan, after the timer the discovery gets cleaned and avoids memory leaks.
const NEEO_DRIVER_SEARCH_DELAY = 8000; //Delay before responding on a discovery request. this gives the driver the time to discover, get mac, build RPC etc..

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
  getNowPlayingLabel,
  getNowPlayingImg,
  setVolume,
  getVolume,
  kodiReady,
  sendCommand,
  sendContentAwareCommand,
  SendComponentUpdate
};

//discover();

function addDeviceDiscoveryPassword(pass) {
  console.log("Passord used:", pass);
  addDevicePassword = pass;
  return true;
}

//This is called by neeo when searching for a kodi driver.
function discovered() {
  console.log("Discovered devices requested by NEEO.");
  discover();
  return new Promise(function(resolve, reject) {
    setTimeout(() => {
      console.log("Responding discovered devices to NEEO.");
      let kodi = [];
      for (let devideId in kodiDB) {
        kodi.push({
          id: kodiDB[devideId].mac,
          name: kodiDB[devideId].name,
          reachable: kodiDB[devideId].reachable
        });
      }
      resolve(kodi);
    }, NEEO_DRIVER_SEARCH_DELAY);
  });
}

// Init driver.
function initialise() {
  console.log("Initialize KODI Controller.");
  discover();
}

// Discover KODI instances.
function discover() {
  if (!lastDiscovery || Date.now() - lastDiscovery > MDNS_TIMEOUT) {
    lastDiscovery = Date.now();
    mdnsBrowser = mdns.createBrowser("_xbmc-jsonrpc-h._tcp");

    mdnsBrowser.on("ready", function() {
      console.log("MDNS:  Start");
      mdnsBrowser.discover();
    });

    mdnsBrowser.on("update", function(data) {
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
  const httpPort = discoveredData.port;
  const reachable = true;
  const name = discoveredData.fullname.replace(/\._xbmc-jsonrpc-h\._tcp\.local/g, "");
  const username = "kodi"; // Preparation for user pass setting.
  const password = "kodi"; // Preperation for user pass setting.
  const rpc = kodirpc.build(ip, httpPort, username, password); ///needs to be removed and changed to 9090

  getMacadress(rpc).then(mac => {
    console.log(`KODIdb:  Discovered KODI instance with IP:${ip}, PORT:${httpPort},MAC:${mac}, NAME:${name}.`);
    const ws = new kodiConnector(mac, ip, httpPort, username, password);
    kodiDB[mac] = { name, ip, httpPort, mac, reachable, ws };

    kodiDB[mac].ws.events.on("notification", x => {
      handleKodiEvents(x);
    });

    kodiDB[mac].ws.events.on("connected", x => {
      setTimeout(() => {
        conectedMessage(x.mac);
      }, 5000);
    });

    if (mac == discoveryConnect) {
      kodiDB[mac].ws.connect();
    }
  });
}

function handleKodiEvents(x) {
  if (x.type === "VolumeChanged") {
    console.log(`KODI instance ${x.mac} changed volume to ${x.volume}%`);
    updateComponent(x.mac, "VOLUMESLIDER", x.volume);
  }
  if (x.type === "PlayingChanged") {
    console.log(`KODI instance ${x.mac} now playing, ${x.title}`);
    updateComponent(x.mac, "NOWPLAYINGLABEL", x.title);
    updateComponent(x.mac, "NOWPLAYINGIMGSMALL", x.image);
    updateComponent(x.mac, "NOWPLAYINGIMGLARGE", x.image);
  }
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
  });
}

function kodiReady(deviceID) {
  if (typeof kodiDB[deviceID] !== "undefined") {
    if (kodiDB[deviceID].ws.isConnected()) {
      return true;
    } else {
      kodiDB[deviceID].ws.connect();
      return false;
    }
  } else {
    discoveryConnect = deviceID;
    discover();
    return false;
  }
}

//getRecentlyAddedMovies
function getRecentlyAddedMovies(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    return kodiDB[deviceId].ws.send("VideoLibrary.GetRecentlyAddedMovies", { properties: ["thumbnail", "playcount", "year", "genre"], limits: { start: 0, end: 30 } });
  } else {
    return Promise.resolve({});
  }
}

function getMovies(deviceId, filter, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    let queery = {};
    if (filter.field) {
      queery = { properties: ["thumbnail", "playcount", "year", "genre"], filter, sort: { order: "ascending", method: "title" }, limits: { start: offset, end: end } };
    } else {
      queery = { properties: ["thumbnail", "playcount", "year", "genre"], sort: { order: "ascending", method: "title" }, limits: { start: offset, end: end } };
    }
    return kodiDB[deviceId].ws.send("VideoLibrary.GetMovies", queery);
  } else {
    return Promise.resolve({});
  }
}

function GetMovieDetails(deviceId, movieId) {
  if (kodiReady(deviceId)) {
    return kodiDB[deviceId].ws.send("VideoLibrary.GetMovieDetails", { movieid: movieId, properties: ["thumbnail", "title", "year"] });
  } else {
    return Promise.resolve({});
  }
}

function getRecentEpisodes(deviceId) {
  if (kodiReady(deviceId)) {
    return kodiDB[deviceId].ws.send("VideoLibrary.GetEpisodes", { properties: ["title", "showtitle", "season", "episode", "art"], limits: { start: 0, end: 30 }, sort: { order: "descending", method: "dateadded" } });
  } else {
    return Promise.resolve({});
  }
}

function getTVshowEpisodes(deviceId, showId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    let queery = { tvshowid: showId, limits: { start: offset, end: end }, properties: ["title", "season", "episode", "art"] };
    return kodiDB[deviceId].ws.send("VideoLibrary.GetEpisodes", queery);
  } else {
    return Promise.resolve({});
  }
}

function getTVShows(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    let queery = { sort: { order: "ascending", method: "title" }, limits: { start: offset, end: end }, properties: ["thumbnail"] };
    return kodiDB[deviceId].ws.send("VideoLibrary.GetTVShows", queery);
  } else {
    return Promise.resolve({});
  }
}

function getAlbums(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    return kodiDB[deviceId].ws.send("AudioLibrary.GetAlbums", { properties: ["thumbnail", "artist", "albumlabel"], sort: { method: "title", order: "ascending", ignorearticle: true }, limits: { start: offset, end: end } });
  } else {
    return Promise.resolve({});
  }
}

function getLatestAlbums(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    return kodiDB[deviceId].ws.send("AudioLibrary.GetRecentlyAddedAlbums", { properties: ["thumbnail", "artist", "albumlabel"], limits: { start: offset, end: end } });
  } else {
    return Promise.resolve({});
  }
}

function getAlbumTracks(deviceId, id, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    return kodiDB[deviceId].ws.send("AudioLibrary.GetSongs", { properties: ["title", "thumbnail", "artist", "album", "track"], sort: { method: "track", order: "ascending", ignorearticle: true }, filter: { albumid: id }, limits: { start: offset, end: end } });
  } else {
    return Promise.resolve({});
  }
}

function getMusicVideos(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    return kodiDB[deviceId].ws.send("VideoLibrary.GetMusicVideos", { properties: ["title", "thumbnail", "artist"], sort: { method: "track", order: "ascending", ignorearticle: true }, limits: { start: offset, end: end } });
  } else {
    return Promise.resolve({});
  }
}

function getPvrRadioChannels(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    return kodiDB[deviceId].ws.send("PVR.GetChannels", { channelgroupid: "allradio", properties: ["thumbnail", "channeltype", "hidden", "locked", "channel", "broadcastnow"], limits: { start: offset, end: end } });
  } else {
    return Promise.resolve({});
  }
}

function getPvrTvChannels(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    return kodiDB[deviceId].ws.send("PVR.GetChannels", { channelgroupid: "alltv", properties: ["thumbnail", "channeltype", "hidden", "locked", "channel", "broadcastnow"], limits: { start: offset, end: end } });
  } else {
    return Promise.resolve({});
  }
}

function getPvrRecordings(deviceId) {
  if (kodiReady(deviceId)) {
    return kodiDB[deviceId].ws.send("PVR.GetRecordings", { properties: ["title", "starttime", "endtime", "art"] });
  } else {
    return Promise.resolve({});
  }
}

function getNowPlayingImg(deviceId) {
  if (kodiReady(deviceId)) {
    return kodiDB[deviceId].ws.nowPlayingImg;
  } else {
    return images.logo_KODI_tp;
  }
}

function getNowPlayingLabel(deviceId) {
  if (kodiReady(deviceId)) {
    return kodiDB[deviceId].ws.nowPlayingLabel;
  } else {
    return "";
  }
}

function getVolume(deviceId) {
  if (kodiReady(deviceId)) {
    return kodiDB[deviceId].ws.volume;
  } else {
    return 0;
  }
}

function setVolume(deviceId, volume) {
  if (kodiReady(deviceId)) {
    volume = parseInt(volume, 10);
    kodiDB[deviceId].ws.volume = volume;
    kodiDB[deviceId].ws.send("Application.SetVolume", { volume });
  }
}

function playerOpen(deviceId, object) {
  if (kodiReady(deviceId)) {
    kodiDB[deviceId].ws.send("Player.Open", { item: object }).catch(e => {
      disconnected(deviceId, e);
    });
  }
}

function sendCommand(deviceId, method, params, timer) {
  if (kodiReady(deviceId)) {
    if (params == "{}") {
      kodiDB[deviceId].ws.send(method).catch(e => {
        disconnected(deviceId, e);
      });
    } else {
      kodiDB[deviceId].ws.send(method, params).catch(e => {
        disconnected(deviceId, e);
      });
    }
  } else {
    //if kodi is not connected
    const time = timer || Date.now();
    if (method == "WOL") {
      wol.powerOnKodi(deviceId, getKodiIp(deviceId));
      if (Date.now() - time < COMMAND_QUEUE_TIMEOUTLONG) {
        setTimeout(() => {
          sendCommand(deviceId, method, params, time);
        }, COMMAND_QUEUE_INTERVAL);
      }
    }
  }
}

function sendContentAwareCommand(deviceId, method, params) {
  sendCommand(deviceId, method, params); //Is allways send, checked official kodi remote app.
  if (kodiReady(deviceId)) {
    if (method == "Input.right" || method == "Input.left" || method == "Input.down" || method == "Input.up" || method == "Input.select" || method == "Player.SetSpeed") {
      kodiDB[deviceId].ws.send("GUI.GetProperties", { properties: ["currentwindow", "fullscreen"] }).then(window => {
        if (window.currentwindow.label == "Fullscreen video") {
          kodiDB[deviceId].ws.send("XBMC.GetInfoBooleans", { booleans: ["VideoPlayer.HasMenu", "Pvr.IsPlayingTv"] }).then(resp => {
            console.log("CAC HasMenu:", resp["VideoPlayer.HasMenu"]);
            console.log("CAC IsPlayingTv:", resp[`Pvr.IsPlayingTv`]);
            if (resp[`Pvr.IsPlayingTv`]) {
              if (method == "Player.SetSpeed" && params == '{"playerid":1,"speed":-2}') {
                sendCommand(deviceId, "Input.ExecuteAction", { action: "channeldown" });
              }
              if (method == "Player.SetSpeed" && params == '{"playerid":1,"speed":2}') {
                sendCommand(deviceId, "Input.ExecuteAction", { action: "channelup" });
              }
            }
            if (!resp[`VideoPlayer.HasMenu`]) {
              if (method == "Input.up") {
                sendCommand(deviceId, "Player.Seek", { value: "bigforward", playerid: 1 });
              }
              if (method == "Input.down") {
                sendCommand(deviceId, "Player.Seek", { value: "bigbackward", playerid: 1 });
              }
              if (method == "Input.left") {
                sendCommand(deviceId, "Player.Seek", { value: "smallbackward", playerid: 1 });
              }
              if (method == "Input.right") {
                sendCommand(deviceId, "Player.Seek", { value: "smallforward", playerid: 1 });
              }
              if (method == "Input.select") {
                sendCommand(deviceId, "Input.ShowOSD", "{}");
              }
            } //if (!resp.VideoPlayer.HasMenu){
          }); // RPC XBMC.GetInfoBooleans
        } // if (window.fullscreen)else do nothing
      }); // Get getProperties currentwindow
    } // if input Input.right ++
  } // If Kodi is ready
} // function

function conectedMessage(deviceId) {
  const message = {
    title: "NEEO",
    message: "The NEEO IP driver is connected",
    image: images.logo_NEEO_Twitter,
    displaytime: CONNECTED_BANNER_TIME
  };
  if (kodiReady(deviceId)) {
    kodiDB[deviceId].ws.send("GUI.ShowNotification", message);
  }
}

/////////////////////////////////////////////// REMOVE
function disconnected(deviceId, error) {
  console.log(`Got an error from KODI with ID "${deviceId}".`);
  console.log(error);
  console.log(`Marking KODI with ID "${deviceId}" as offline.`);
  kodiDB[deviceId].reachable = false;
}

function updateComponent(uniqueDeviceId, component, value) {
  if (typeof sendComponentUpdate === "function" && typeof uniqueDeviceId === "string" && typeof component === "string" && typeof value !== "undefined") {
    sendComponentUpdate({
      uniqueDeviceId: uniqueDeviceId,
      component: component,
      value: value
    }).catch(error => {
      console.log("[CONTROLLER] Failed to send notification", error.message);
    });
  }
}
