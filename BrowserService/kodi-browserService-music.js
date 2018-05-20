'use strict';
const images = require('../images');
const neeoapi = require('neeo-sdk');
const kodiController = require('../kodi-controller');
const tools = require('../tools');

const DEFAULT_PATH = '.';

/* let recentMovies = {};
let allMovies = {};
let timestamp = {}; */

let globalOptions = {
  persistImages: false,
  hideThumbnails: false,
};

module.exports = {
  browse,
  setOptions,
  startMovie,
  sendCommand
};

/* function getRecentlyAddedMovies(kodiParams){
  console.log ("Updated database getRecentlyAddedMovies");
  let kodiRPC = kodirpc.build(kodiParams);
  if (kodiRPC){
    kodiRPC.videolibrary.getRecentlyAddedMovies({"limits": { "start" : 0, "end": 30 }}).then((x)=>{
      recentMovies[kodiParams.mac] =  x.movies;
      console.log ("Updated database with:", recentMovies[kodiParams.mac], "items");
    });
  }
}

function getAllMovies(kodiParams){
  console.log ("Updated database allMovies");
  let kodiRPC = kodirpc.build(kodiParams);
  if (kodiRPC){
    kodiRPC.videolibrary.getMovies({"sort": {"order": "ascending", "method": "title"}}).then((x)=>{
      allMovies[kodiParams.mac] =  x.movies;
      console.log ("Updated database with:", allMovies[kodiParams.mac], "items");
    });
  }
} */



function startMovie (kodiParams, movieid){
  console.log ("Now starting movie with movieid:",movieid);
}

function sendCommand (kodiParams,method,params){
  console.log ("Sending command:",method,params);
}



function browse(kodiParams, params) {
  console.log ("BROWSEING", params.browseIdentifier);
  return baseListMenu(kodiParams);
}

function setOptions(params) {
  globalOptions = Object.assign({}, globalOptions, params);
}


//////////////////////////////////
// Base Movie Menu
function baseListMenu(kodiParams){

  console.log ("DEBUG:", kodiDiscover.getKodi(kodiParams.mac)) 
  const options = {
    title: `Movies`,
    totalMatchingItems: 1,
    browseIdentifier: ".",
    offset: 0,
    limit: 10
  };
  const list = neeoapi.buildBrowseList(options);
 
  if (typeof kodiParams !== "undefined"){
    list.addListHeader('Music');
    list.addListItem({
      title: "Music Videos",
      thumbnailUri: images.icon_music,
      browseIdentifier: "Music Videos"
    });
    list.addListItem({
      title: "Albums",
      thumbnailUri: images.icon_music, 
      browseIdentifier: "Albums"
    });
    list.addListItem({
      title: "Tracks",
      thumbnailUri: images.icon_music, 
      browseIdentifier: "Tracks"
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
