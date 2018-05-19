'use strict';

const images = require('./images');
const neeoapi = require('neeo-sdk');
const kodiDiscover = require('./kodi-controller');
const kodirpc = require('./kodi-rpc');
const tools = require('./tools');

const DEFAULT_PATH = '.';

let globalOptions = {
  persistImages: false,
  hideThumbnails: false,
};

let tvShows = {};
let RecentEpisodes = {};
let timestamp = {};

module.exports = {
  browse,
  setOptions,
  startMovie,
  sendCommand
};

function getRecentEpisodes(kodiParams){
  console.log ("Updated database getRecentEpisodes");
  let kodiRPC = kodirpc.build(kodiParams);
  if (kodiRPC){
    kodiRPC.videolibrary.getRecentlyAddedEpisodes().then((x)=>{
      //recentEpisodes[kodiParams.mac] =  x.movies;
      //console.log ("Updated database with:", tvShows[kodiParams.mac].length, "items");
    });
  }
}

function getTVShows(kodiParams){
  console.log ("Updated database getTVShows");
  let kodiRPC = kodirpc.build(kodiParams);
  if (kodiRPC){
    kodiRPC.videolibrary.getTVShows({"sort": {"order": "ascending", "method": "title"}}).then((x)=>{
      tvShows[kodiParams.mac] =  x.tvshows;
      console.log ("Updated database with:", tvShows[kodiParams.mac].length, "items");
    });
  }
}



function startMovie (kodiParams, movieid){
  console.log ("Now starting movie with movieid:",movieid);
}

function sendCommand (kodiParams,method,params){
  console.log ("Sending command:",method,params);
}



function browse(kodiParams, params) {
  
  const browseIdentifier = params.browseIdentifier || DEFAULT_PATH;
  const listOptions = {
    limit: params.limit,
    offset: params.offset,
    browseIdentifier,
  };
  console.log ("BROWSEING", browseIdentifier);

  if (browseIdentifier == "TV Shows"){
    getTVShows(kodiParams);
    if (tvShows[kodiParams.mac]){
      return listMovies(kodiParams, tvShows[kodiParams.mac], listOptions);
    } else {
      return baseListMenu(kodiParams);
    }

  //If Recent Episodes
  } else if (browseIdentifier == "Recent Episodes") {
    getRecentEpisodes(kodiParams);
    if (RecentEpisodes[kodiParams.mac]){
      return listMovies(kodiParams, RecentEpisodes[kodiParams.mac], listOptions);
    } else {
      return baseListMenu(kodiParams);
    }
    
  //Base Menu
  } else {
    updateDatabase(kodiParams);
    return baseListMenu(kodiParams);
  }
}

function updateDatabase(kodiParams){
  if (typeof kodiParams !== "undefined" && (typeof timestamp[kodiParams.mac] === "undefined" || (Date.now() - timestamp[kodiParams.mac] > 6000))){
    console.log("->  Updating all databases.")
    getRecentEpisodes(kodiParams);
    getTVShows(kodiParams);
    timestamp[kodiParams.mac] = Date.now();
  } else {
    console.log("XXX Updating all databases.")
  }
}

function setOptions(params) {
  globalOptions = Object.assign({}, globalOptions, params);
}


//////////////////////////////////
// Base Movie Menu
function baseListMenu(kodiParams){
  const options = {
    title: `TV Shows`,
    totalMatchingItems: 1,
    browseIdentifier: ".",
    offset: 0,
    limit: 10
  };
  const list = neeoapi.buildBrowseList(options);
 
  if (typeof kodiParams !== "undefined"){
    list.addListHeader('TV Shows');
    list.addListItem({
      title: "TV Shows",
      thumbnailUri: images.icon_tvshow,
      browseIdentifier: "TV Shows"
    });
    list.addListItem({
      title: "Recent Episodes",
      thumbnailUri: images.icon_tvshow,
      browseIdentifier: "Recent Episodes"
    });
  } else {
    list.addListHeader('Kodi is not connected');
    list.addListItem({
      title: "Tap to refresh",
      thumbnailUri: images.icon_movie,
      browseIdentifier: "."
    });
  }
  return list;
}

function imageToHttp (kodiParams, uri) {
  uri = encodeURIComponent(uri)
  let url = `http://${kodiParams.ip}:${kodiParams.port}/image/${uri}`
  return url;
}

function movieTitle (movie) {
  const year = ' ('+movie.year+')' || '';
  return movie.label+year;
}
