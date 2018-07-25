"use strict";

const mdns = require("mdns-js");
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
const NEEO_DRIVER_SEARCH_DELAY = 3000; //Delay before responding on a discovery request. this gives the driver the time to discover, get mac, build RPC etc..

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
  getNowPlayingDescription,
  getNowPlayingImg,
  getNowPlaying,
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
      console.log("Discovery:  Start");
      mdnsBrowser.discover();
    });

    mdnsBrowser.on("update", function(data) {
      addKoditoDB(data);
    });

    setTimeout(() => {
      mdnsBrowser.stop();
      console.log("Discovery:  Stop");
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

  kodiConnector.getMac(ip).then(mac => {
    console.log(`KODIdb:  Discovered KODI instance with IP:${ip}, PORT:${httpPort}, MAC:${mac}, NAME:${name}.`);
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
  console.log(`EVENT_DEBUG: ${x.type}`);
  if (x.type === "VolumeChanged") {
    console.log(`KODI instance ${x.mac} changed volume to ${x.volume}%`);
    updateComponent(x.mac, "VOLUME", x.volume);
  } else if (x.type === "PlayingChanged") {
    console.log(`KODI instance ${x.mac} now playing, ${x.title}`);
    updateComponent(x.mac, "PLAYING", true);
    updateComponent(x.mac, "COVER_ART_SENSOR", x.image);
    updateComponent(x.mac, "TITLE_SENSOR", x.title);
    updateComponent(x.mac, "DESCRIPTION_SENSOR", x.description);
    updateComponent(x.mac, "NOWPLAYINGLABEL", x.title);
    updateComponent(x.mac, "NOWPLAYINGIMGSMALL", x.image);
    updateComponent(x.mac, "NOWPLAYINGIMGLARGE", x.image);
  } else if (x.type == "PlayingStopped") {
    console.log(`KODI instance ${x.mac} stoped playing.`);
    updateComponent(x.mac, "PLAYING", false);
    updateComponent(x.mac, "COVER_ART_SENSOR", x.image);
    updateComponent(x.mac, "TITLE_SENSOR", x.title);
    updateComponent(x.mac, "DESCRIPTION_SENSOR", x.description);
    updateComponent(x.mac, "NOWPLAYINGLABEL", x.title);
    updateComponent(x.mac, "NOWPLAYINGIMGSMALL", x.image);
    updateComponent(x.mac, "NOWPLAYINGIMGLARGE", x.image);
  } else if (x.type == "PlayingPaused") {
    console.log(`KODI instance ${x.mac} paused.`);
    updateComponent(x.mac, "PLAYING", false);
    updateComponent(x.mac, "DESCRIPTION_SENSOR", x.description);
  } else {
    console.log(`KODI instance ${x.mac} Feature TYPE: ${x.type} is not implemented in driver.`);
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
  const end = offset + limit;
  const queery = {
    properties: ["thumbnail", "playcount", "year", "genre"],
    limits: { start: 0, end: 30 }
  };
  if (kodiReady(deviceId)) {
    return kodiDB[deviceId].ws.send("VideoLibrary.GetRecentlyAddedMovies", queery).then(x => {
      const listItems = tools.itemCheck(x, "movies");
      return listItems.map(item => {
        return {
          thumbnailUri: tools.imageToHttp(kodiDB[deviceId], item.thumbnail),
          title: `${item.label} (${item.year})`,
          label: item.genre.join(", "),
          actionIdentifier: `movieid;${item.movieid}`
        };
      });
    });
  } else {
    return Promise.resolve({});
  }
}

function getMovies(deviceId, filter, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    let queery = {};
    if (filter.field) {
      queery = {
        properties: ["thumbnail", "playcount", "year", "genre"],
        filter,
        sort: { order: "ascending", method: "title" },
        limits: { start: offset, end: end }
      };
    } else {
      queery = {
        properties: ["thumbnail", "playcount", "year", "genre"],
        sort: { order: "ascending", method: "title" },
        limits: { start: offset, end: end }
      };
    }
    return kodiDB[deviceId].ws.send("VideoLibrary.GetMovies", queery).then(x => {
      const listItems = tools.itemCheck(x, "movies");
      return listItems.map(item => {
        return {
          thumbnailUri: tools.imageToHttp(kodiDB[deviceId], item.thumbnail),
          title: `${item.label} (${item.year})`,
          label: item.genre.join(", "),
          actionIdentifier: `movieid;${item.movieid}`
        };
      });
    });
  } else {
    return Promise.resolve({});
  }
}

function GetMovieDetails(deviceId, movieId) {
  if (kodiReady(deviceId)) {
    return kodiDB[deviceId].ws.send("VideoLibrary.GetMovieDetails", {
      movieid: movieId,
      properties: ["thumbnail", "title", "year"]
    });
  } else {
    return Promise.resolve({});
  }
}

function getRecentEpisodes(deviceId) {
  if (kodiReady(deviceId)) {
    const queery = {
      properties: ["title", "showtitle", "season", "episode", "art"],
      limits: { start: 0, end: 30 },
      sort: { order: "descending", method: "dateadded" }
    };
    return kodiDB[deviceId].ws.send("VideoLibrary.GetEpisodes", queery).then(x => {
      const listItems = tools.itemCheck(x, "episodes");
      return listItems.map(item => {
        return {
          thumbnailUri: tools.imageToHttp(kodiDB[deviceId], item.art.thumb),
          title: `${item.showtitle}`,
          label: `S${item.season} E${item.episode},  ${item.title}`,
          actionIdentifier: `episodeid;${item.episodeid}`
        };
      });
    });
  } else {
    return Promise.resolve({});
  }
}

function getTVshowEpisodes(deviceId, showId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    const queery = {
      tvshowid: showId,
      limits: { start: offset, end: end },
      properties: ["title", "season", "episode", "art", "showtitle"]
    };
    return kodiDB[deviceId].ws.send("VideoLibrary.GetEpisodes", queery).then(x => {
      const listItems = tools.itemCheck(x, "episodes");
      return listItems.map(item => {
        return {
          thumbnailUri: tools.imageToHttp(kodiDB[deviceId], item.art.thumb),
          title: `${item.showtitle}`,
          label: `S${item.season} E${item.episode},  ${item.title}`,
          actionIdentifier: `episodeid;${item.episodeid}`
        };
      });
    });
  } else {
    return Promise.resolve({});
  }
}

function getTVShows(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    const queery = {
      sort: { order: "ascending", method: "title" },
      limits: { start: offset, end: end },
      properties: ["thumbnail", "year"]
    };
    return kodiDB[deviceId].ws.send("VideoLibrary.GetTVShows", queery).then(x => {
      const listItems = tools.itemCheck(x, "tvshows");
      return listItems.map(item => {
        return {
          thumbnailUri: tools.imageToHttp(kodiDB[deviceId], item.thumbnail),
          title: item.label,
          label: `${item.label} (${item.year})`,
          browseIdentifier: `tvshowid;${item.tvshowid};${item.label}`
        };
      });
    });
  } else {
    return Promise.resolve({});
  }
}

function getAlbums(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    const queery = {
      properties: ["thumbnail", "artist", "albumlabel"],
      sort: { method: "title", order: "ascending", ignorearticle: false },
      limits: { start: offset, end: end }
    };
    return kodiDB[deviceId].ws.send("AudioLibrary.GetAlbums", queery).then(x => {
      const listItems = tools.itemCheck(x, "albums");
      return listItems.map(item => {
        return {
          thumbnailUri: tools.imageToHttp(kodiDB[deviceId], item.thumbnail),
          title: item.label,
          label: item.artist.join(", "),
          browseIdentifier: `albumid;${item.albumid};${item.label}`
        };
      });
    });
  } else {
    return Promise.resolve({});
  }
}

function getLatestAlbums(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    const queery = {
      properties: ["thumbnail", "artist", "albumlabel"],
      limits: { start: offset, end: end }
    };
    return kodiDB[deviceId].ws.send("AudioLibrary.GetRecentlyAddedAlbums", queery).then(x => {
      const listItems = tools.itemCheck(x, "albums");
      return listItems.map(item => {
        return {
          thumbnailUri: tools.imageToHttp(kodiDB[deviceId], item.thumbnail),
          title: item.label,
          label: item.artist.join(", "),
          browseIdentifier: `albumid;${item.albumid};${item.label}`
        };
      });
    });
  } else {
    return Promise.resolve({});
  }
}

function getAlbumTracks(deviceId, id, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    const queery = {
      properties: ["title", "thumbnail", "artist", "album", "track"],
      sort: { method: "track", order: "ascending", ignorearticle: false },
      filter: { albumid: id },
      limits: { start: offset, end: end }
    };
    return kodiDB[deviceId].ws.send("AudioLibrary.GetSongs", queery).then(x => {
      let listItems = tools.itemCheck(x, "songs");
      listItems = listItems.map(item => {
        return {
          thumbnailUri: tools.imageToHttp(kodiDB[deviceId], item.thumbnail),
          title: `${item.track}.  ${item.label}`,
          label: item.artist.join(", "),
          actionIdentifier: `songid;${item.songid}`
        };
      });
      listItems.unshift({
        title: "Play Album",
        thumbnailUri: images.icon_music,
        actionIdentifier: `albumid;${id}`
      });
      return listItems;
    });
  } else {
    return Promise.resolve({});
  }
}

function getMusicVideos(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    const queery = {
      properties: ["title", "thumbnail", "artist"],
      sort: { method: "track", order: "ascending", ignorearticle: false },
      limits: { start: offset, end: end }
    };
    return kodiDB[deviceId].ws.send("VideoLibrary.GetMusicVideos", queery).then(x => {
      const listItems = tools.itemCheck(x, "musicvideos");
      return listItems.map(item => {
        return {
          thumbnailUri: tools.imageToHttp(kodiDB[deviceId], item.thumbnail),
          title: item.title,
          label: item.artist.join(", "),
          actionIdentifier: `musicvideoid;${item.musicvideoid}`
        };
      });
    });
  } else {
    return Promise.resolve({});
  }
}

function getPvrRadioChannels(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    const queery = {
      channelgroupid: "allradio",
      properties: ["thumbnail", "channeltype", "hidden", "locked", "channel", "broadcastnow"],
      limits: { start: offset, end: end }
    };
    return kodiDB[deviceId].ws.send("PVR.GetChannels", queery).then(x => {
      const listItems = tools.itemCheck(x, "channels");
      let broadcastnowTitle = "";
      if (typeof item.broadcastnow != "undefined" && typeof item.broadcastnow.title != "undefined") {
        broadcastnowTitle = item.broadcastnow.title;
      }
      return listItems.map(item => {
        return {
          thumbnailUri: tools.imageToHttp(kodiDB[deviceId], item.thumbnail),
          title: item.label,
          label: broadcastnowTitle,
          actionIdentifier: `channelid;${item.channelid}`
        };
      });
    });
  } else {
    return Promise.resolve({});
  }
}

function getPvrTvChannels(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    const queery = {
      channelgroupid: "alltv",
      properties: ["thumbnail", "channeltype", "hidden", "locked", "channel", "broadcastnow"],
      limits: { start: offset, end: end }
    };
    return kodiDB[deviceId].ws.send("PVR.GetChannels", queery).then(x => {
      const listItems = tools.itemCheck(x, "channels");
      let broadcastnowTitle = "";
      if (typeof item.broadcastnow != "undefined" && typeof item.broadcastnow.title != "undefined") {
        broadcastnowTitle = item.broadcastnow.title;
      }
      return listItems.map(item => {
        return {
          thumbnailUri: tools.imageToHttp(kodiDB[deviceId], item.thumbnail),
          title: item.label,
          label: broadcastnowTitle,
          actionIdentifier: `channelid;${item.channelid}`
        };
      });
    });
  } else {
    return Promise.resolve({});
  }
}

function getPvrRecordings(deviceId, offset, limit) {
  if (kodiReady(deviceId)) {
    const end = offset + limit;
    const queery = {
      properties: ["title", "starttime", "endtime", "art"],
      limits: { start: offset, end: end }
    };
    return kodiDB[deviceId].ws.send("PVR.GetRecordings", queery).then(x => {
      const listItems = tools.itemCheck(x, "recordings");
      return listItems.map(item => {
        return {
          thumbnailUri: tools.imageToHttp(kodiDB[deviceId], item.title),
          title: item.title,
          label: item.label,
          actionIdentifier: `recordingid;${item.recordingid}`
        };
      });
    });
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

function getNowPlaying(deviceId) {
  if (kodiReady(deviceId)) {
    return kodiDB[deviceId].ws.nowPlaying;
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

function getNowPlayingDescription(deviceId) {
  if (kodiReady(deviceId)) {
    return kodiDB[deviceId].ws.nowPlayingDescription;
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
      kodiDB[deviceId].ws
        .send("GUI.GetProperties", {
          properties: ["currentwindow", "fullscreen"]
        })
        .then(window => {
          if (window.currentwindow.label == "Fullscreen video") {
            kodiDB[deviceId].ws
              .send("XBMC.GetInfoBooleans", {
                booleans: ["VideoPlayer.HasMenu", "Pvr.IsPlayingTv"]
              })
              .then(resp => {
                console.log("CAC HasMenu:", resp["VideoPlayer.HasMenu"]);
                console.log("CAC IsPlayingTv:", resp[`Pvr.IsPlayingTv`]);
                if (resp[`Pvr.IsPlayingTv`]) {
                  if (method == "Player.SetSpeed" && params == '{"playerid":1,"speed":-2}') {
                    sendCommand(deviceId, "Input.ExecuteAction", {
                      action: "channeldown"
                    });
                  }
                  if (method == "Player.SetSpeed" && params == '{"playerid":1,"speed":2}') {
                    sendCommand(deviceId, "Input.ExecuteAction", {
                      action: "channelup"
                    });
                  }
                }
                if (!resp[`VideoPlayer.HasMenu`]) {
                  if (method == "Input.up") {
                    sendCommand(deviceId, "Player.Seek", {
                      value: "bigforward",
                      playerid: 1
                    });
                  }
                  if (method == "Input.down") {
                    sendCommand(deviceId, "Player.Seek", {
                      value: "bigbackward",
                      playerid: 1
                    });
                  }
                  if (method == "Input.left") {
                    sendCommand(deviceId, "Player.Seek", {
                      value: "smallbackward",
                      playerid: 1
                    });
                  }
                  if (method == "Input.right") {
                    sendCommand(deviceId, "Player.Seek", {
                      value: "smallforward",
                      playerid: 1
                    });
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
