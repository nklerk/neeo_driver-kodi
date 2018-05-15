'use strict';

const images = require('./images');
const neeoapi = require('neeo-sdk');
const kodi_rpc = require('node-kodi');
const kodiDiscover = require('./kodi-discover')

const DEFAULT_PATH = '.';

let recentMovies = {};
let allMovies = {};
let timestamp = {};

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


function getRecentlyAddedMovies(kodiParams){
  console.log ("Updated database getRecentlyAddedMovies");
  if (kodiParams && kodiParams.ip && kodiParams.port){
    let kodiRPC = new kodi_rpc({
      url: `${kodiParams.ip}:${kodiParams.port}`,
      user: "Kodi",
      password: ""
    });
    kodiRPC.videolibrary.getRecentlyAddedMovies({"limits": { "start" : 0, "end": 30 }}).then((x)=>{
      recentMovies[kodiParams.mac] =  x.movies;
      console.log ("Updated database with:", recentMovies[kodiParams.mac], "items");
    });
  }
}

function getAllMovies(kodiParams){
  console.log ("Updated database allMovies");
  if (kodiParams && kodiParams.ip && kodiParams.port){
    let kodiRPC = new kodi_rpc({
      url: `${kodiParams.ip}:${kodiParams.port}`,
      user: "Kodi",
      password: ""
    });
    kodiRPC.videolibrary.getMovies({"sort": {"order": "ascending", "method": "title"}}).then((x)=>{
      allMovies[kodiParams.mac] =  x.movies;
      console.log ("Updated database with:", allMovies[kodiParams.mac], "items");
    });
  }
}



function startMovie (kodiParams, movieid){
  console.log ("Now starting movie with movieid:",movieid);
  movieid = parseInt(movieid, 10);
  if (kodiParams && kodiParams.ip && kodiParams.port){
    let kodiRPC = new kodi_rpc({
      url: `${kodiParams.ip}:${kodiParams.port}`,
      user: "Kodi",
      password: ""
    });
    kodiRPC.player.open({item:{movieid}});
  }
}

function sendCommand (kodiParams,method,params){
  console.log ("Sending command:",method,params);
  if (kodiParams && kodiParams.ip && kodiParams.port){
    let kodiRPC = new kodi_rpc({
      url: `${kodiParams.ip}:${kodiParams.port}`,
      user: "Kodi",
      password: ""
    });
    kodiRPC.rpc(method,params);
  }
}



function browse(kodiParams, params) {
  
  console.log ("BROWSEING", params.browseIdentifier);
  const browseIdentifier = params.browseIdentifier || DEFAULT_PATH;
  const listOptions = {
    limit: params.limit,
    offset: params.offset,
    browseIdentifier,
  };

  //If All Movies
  if (browseIdentifier == "All Movies"){
    getAllMovies(kodiParams);
    if (allMovies[kodiParams.mac]){
      return listMovies(kodiParams, allMovies[kodiParams.mac], listOptions);
    } else {
      return baseListMenu(kodiParams);
    }

  //If Recent Movies
  } else if (browseIdentifier == "Recent Movies") {
    getRecentlyAddedMovies(kodiParams);
    if (recentMovies[kodiParams.mac]){
      return listMovies(kodiParams, recentMovies[kodiParams.mac], listOptions);
    } else {
      return baseListMenu(kodiParams);
    }
    
  //Base Menu
  } else {
    updateDatabase(kodiParams);
    return baseListMenu(kodiParams);
  }
}

function setOptions(params) {
  globalOptions = Object.assign({}, globalOptions, params);
}


function updateDatabase(kodiParams){
  if (typeof kodiParams !== "undefined" && (typeof timestamp[kodiParams.mac] === "undefined" || (Date.now() - timestamp[kodiParams.mac] > 6000))){
    console.log("->  Updating all databases.")
    getRecentlyAddedMovies(kodiParams);
    getAllMovies(kodiParams);
    timestamp[kodiParams.mac] = Date.now();
  } else {
    console.log("XXX Updating all databases.")
  }
}


//////////////////////////////////
// List Movies

function listMovies(kodiParams, movies, listOptions) {
  
  const options = {
    title: `Browsing ${listOptions.browseIdentifier}`,
    totalMatchingItems: movies.length,
    browseIdentifier: listOptions.browseIdentifier,
    offset: listOptions.offset,
    limit: listOptions.limit,
  };
  const list = neeoapi.buildBrowseList(options);
  const itemsToAdd = list.prepareItemsAccordingToOffsetAndLimit(movies);

  console.log ("listOptions.browseIdentifier:", options.browseIdentifier);

  list.addListHeader(options.browseIdentifier);
  itemsToAdd.map((movie) => {
    const listItem = {
      title: movieTitle(movie),
      thumbnailUri: imageToHttp(kodiParams, movie.thumbnail),
      actionIdentifier: `${movie.movieid}`
    };

    list.addListItem(listItem);
  });
  return list;
}


//////////////////////////////////
// Base Movie Menu
function baseListMenu(kodiParams){

  const options = {
    title: `Movies`,
    totalMatchingItems: 1,
    browseIdentifier: ".",
    offset: 0,
    limit: 10
  };
  const list = neeoapi.buildBrowseList(options);
 
  if (typeof kodiParams !== "undefined"){
    list.addListHeader('Movies');
    list.addListItem({
      title: "All Movies",
      thumbnailUri: images.icon_movie,
      browseIdentifier: "All Movies"
    });
    list.addListItem({
      title: "Recent Movies",
      thumbnailUri: images.icon_movie,
      browseIdentifier: "Recent Movies"
    });
    /* list.addListHeader('TV Shows');
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
    list.addListHeader('PVR');
    list.addListItem({
      title: "TV Channels",
      thumbnailUri: images.icon_pvr,
      browseIdentifier: "TV Channels"
    });
    list.addListItem({
      title: "Radio Stations",
      thumbnailUri: images.icon_pvr, 
      browseIdentifier: "Radio Stations"
    });
    list.addListItem({
      title: "Recordings",
      thumbnailUri: images.icon_pvr, 
      browseIdentifier: "Recordings"
    }); */
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
