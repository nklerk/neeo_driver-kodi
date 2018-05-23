'use strict';
const images = require('../images');
const neeoapi = require('neeo-sdk');
const kodiController = require('../kodi-controller');
const tools = require('../tools');


module.exports = {
  browse,
  action
};

function buildBrowseObject(type, filter){
  type = type || '';
  filter = filter || 'All';
  return {type, filter};
}

function action (deviceId, movieId){
  console.log ("Now starting movie with movieid:",movieId);
  kodiController.library.playerOpen(deviceId, {movieid: parseInt(movieId, 10)});
}

function browse(devideId, params) {
  let browseObject = params.browseIdentifier;
  if (browseObject != "") {
    browseObject = tools.s2j(params.browseIdentifier);
  } else {
    browseObject = buildBrowseObject();
  }

  
  console.log ("BROWSEING", browseObject.type);
  const listOptions = {
    limit: params.limit,
    offset: params.offset,
    browseIdentifier: tools.j2s(browseObject),
  };

  //If All Movies
  if (browseObject.type == "Movies"){
    return kodiController.library.getMovies(devideId).then((listItems)=>{
      return formatList(devideId, listItems, listOptions);
    });

  //If Recent Movies
  } else if (browseObject.type == "Recent Movies") {
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
  let browseObject = tools.s2j(listOptions.browseIdentifier);
  const options = {
    title: `Browsing ${browseObject.type}`,
    totalMatchingItems: listItems.length,
    browseIdentifier: listOptions.browseIdentifier,
    offset: listOptions.offset,
    limit: listOptions.limit,
  };

  const list = neeoapi.buildBrowseList(options);
  const itemsToAdd = list.prepareItemsAccordingToOffsetAndLimit(listItems);
  const kodiInstance = kodiController.getKodi(deviceId);
  

  console.log ("browseObject.type:", browseObject.type);


  
  let nextBrowseObject = buildBrowseObject(browseObject.type, browseObject.filter);

 
  if (browseObject.filter == 'All'){
    nextBrowseObject.filter = 'Unwatched';
    list.addListItem({title: 'Filter', label: 'List All', thumbnailUri: images.icon_filter, browseIdentifier: tools.j2s(nextBrowseObject)});

  } else if(browseObject.filter == 'Unwatched'){
    nextBrowseObject.filter = 'Watched';
    list.addListItem({title: 'Filter', label: 'List Unwatched', thumbnailUri: images.icon_filter, browseIdentifier: tools.j2s(nextBrowseObject)});

  } else if (browseObject.filter == 'Watched'){
    nextBrowseObject.filter = 'All';
    list.addListItem({title: 'Filter', label: 'List Watched', thumbnailUri: images.icon_filter, browseIdentifier: tools.j2s(nextBrowseObject)});

  }
  console.log ('Current Filter', browseObject.filter);
  console.log ('Next Filter',nextBrowseObject.filter);

  list.addListHeader(`${browseObject.filter} ${browseObject.type}`);
  itemsToAdd.map((item) => {
    if (browseObject.filter == 'All' || (browseObject.filter == 'Unwatched' && item.playcount == 0) ||  (browseObject.filter == 'Watched' && item.playcount != 0)){
      const listItem = {
        title: tools.movieTitle(item),
        label: tools.arrayToString(item.genre),
        thumbnailUri: tools.imageToHttp(kodiInstance, item.thumbnail),
        actionIdentifier: `${item.movieid}`
      };
      list.addListItem(listItem);
    }
  });
  return list;
}


//////////////////////////////////
// Base Movie Menu
function baseListMenu(deviceId){

  const options = {
    title: `Movies`,
    totalMatchingItems: 2,
    browseIdentifier: ".",
    offset: 0,
    limit: 10
  };
  const list = neeoapi.buildBrowseList(options);
 
  if (kodiController.kodiReady(deviceId)){
    list.addListHeader('Movies');
    list.addListItem({
      title: "Movies",
      thumbnailUri: images.icon_movie,
      browseIdentifier: tools.j2s(buildBrowseObject("Movies", "All"))
    });
    list.addListItem({
      title: "Recent Movies",
      thumbnailUri: images.icon_movie,
      browseIdentifier: tools.j2s(buildBrowseObject("Recent Movies", "All"))
    });
  } else {
    list.addListHeader('Kodi is not connected');
    list.addListItem({
      title: "Tap to refresh",
      thumbnailUri: images.icon_movie,
      browseIdentifier: tools.j2s(buildBrowseObject())
    });
  }
  return list;
}