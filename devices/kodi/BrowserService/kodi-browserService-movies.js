'use strict';
const images = require('../images');
const neeoapi = require('neeo-sdk');
const kodiController = require('../kodi-controller');
const tools = require('../tools');

const DEFAULT_PATH = '.';

module.exports = {
  browse,
  action
};

function action (deviceId, movieId){
  console.log ("Now starting movie with movieid:",movieId);
  kodiController.library.playerOpen(deviceId, {movieid: parseInt(movieId, 10)});
}

function browse(devideId, params) {
  const browseIdentifier = params.browseIdentifier || DEFAULT_PATH;
  console.log ("BROWSEING", browseIdentifier);
  const listOptions = {
    limit: params.limit,
    offset: params.offset,
    browseIdentifier,
  };

  //If All Movies
  if (browseIdentifier == "All Movies"){
    return kodiController.library.getMovies(devideId).then((listItems)=>{
      return formatList(devideId, listItems, listOptions);
    });

  //If Recent Movies
  } else if (browseIdentifier == "Recent Movies") {
    return kodiController.library.getRecentlyAddedMovies(devideId).then((listItems)=>{
      return formatList(devideId, listItems, listOptions);
    }); 
 
  //Base Menu
  } else {
    return baseListMenu(devideId);
  }
}

//////////////////////////////////
// Format Browsing list
function formatList(deviceId, listItems, listOptions) {
  const options = {
    title: `Browsing ${listOptions.browseIdentifier}`,
    totalMatchingItems: listItems.length,
    browseIdentifier: listOptions.browseIdentifier,
    offset: listOptions.offset,
    limit: listOptions.limit,
  };

  const list = neeoapi.buildBrowseList(options);
  const itemsToAdd = list.prepareItemsAccordingToOffsetAndLimit(listItems);
  const kodiInstance = kodiController.getKodi(deviceId);
  

  console.log ("listOptions.browseIdentifier:", options.browseIdentifier);

  list.addListHeader(options.browseIdentifier);
  itemsToAdd.map((item) => {
    const listItem = {
      title: tools.movieTitle(item),
      thumbnailUri: tools.imageToHttp(kodiInstance, item.thumbnail),
      actionIdentifier: `${item.movieid}`
    };
    list.addListItem(listItem);
  });
  return list;
}


//////////////////////////////////
// Base Movie Menu
function baseListMenu(deviceId){

  const options = {
    title: `Movies`,
    totalMatchingItems: 1,
    browseIdentifier: ".",
    offset: 0,
    limit: 10
  };
  const list = neeoapi.buildBrowseList(options);
 
  if (kodiController.kodiReady(deviceId)){
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