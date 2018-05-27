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

function action (deviceId, actionId){

  if(actionId.indexOf('albumid') > -1) {
    actionId = actionId.replace('albumid','');
    kodiController.library.playerOpen(deviceId,{albumid: parseInt(actionId, 10)});
  } else if (actionId.indexOf('songid') > -1) {
    actionId = actionId.replace('songid','');
    kodiController.library.playerOpen(deviceId,{songid: parseInt(actionId, 10)});
  } else if (actionId.indexOf('musicvideoid') > -1) {
    actionId = actionId.replace('musicvideoid','');
    kodiController.library.playerOpen(deviceId,{musicvideoid: parseInt(actionId, 10)});
  }
  
}

function browse(devideId, params) {
  const browseIdentifier = params.browseIdentifier || DEFAULT_PATH;
  console.log ("BROWSEING", browseIdentifier);
  const listOptions = {
    limit: params.limit,
    offset: params.offset,
    browseIdentifier,
  };

  if (browseIdentifier == "Albums"){
    return kodiController.library.getAlbums(devideId).then((listItems)=>{
      return formatList(devideId, listItems, listOptions, browseIdentifier);
    });


  } else if (browseIdentifier == "Recent albums") {
    return kodiController.library.getLatestAlbums(devideId).then((listItems)=>{
      return formatList(devideId, listItems, listOptions, browseIdentifier);
    }); 
    
  } else if (browseIdentifier == "Music Videos") {
    return kodiController.library.getMusicVideos(devideId).then((listItems)=>{
      return formatList(devideId, listItems, listOptions, browseIdentifier);
    }); 
    
  }else if (browseIdentifier.match(/^albumid;[0-9]*;.*$/)) {
    const browseId = browseIdentifier.split(';');
    let id = parseInt(browseId[1], 10);
    return kodiController.library.getAlbumTracks(devideId, id).then((listItems)=>{
      return formatList(devideId, listItems, listOptions, browseIdentifier);
    }); 
    
  //Base Menu
  } else {
    return baseListMenu(devideId);
  }
}

//////////////////////////////////
// Format Browsing list
function formatList(deviceId, listItems, listOptions, title) {

  let browseIdentifier = listOptions.browseIdentifier;

  const options = {
    title: `Browsing ${title}`,
    totalMatchingItems: listItems.length,
    browseIdentifier,
    offset: listOptions.offset,
    limit: listOptions.limit,
  };

  const list = neeoapi.buildBrowseList(options);
  const itemsToAdd = list.prepareItemsAccordingToOffsetAndLimit(listItems);
  const kodiInstance = kodiController.getKodi(deviceId);

  console.log ("browseIdentifier:", browseIdentifier);

  if (browseIdentifier == "Albums" || browseIdentifier == "Recent albums"){
    list.addListHeader(browseIdentifier);
    itemsToAdd.map((item) => {
      const listItem = {
        title: item.label,
        label: tools.arrayToString(item.artist),
        thumbnailUri: tools.imageToHttp(kodiInstance, item.thumbnail),
        browseIdentifier: `albumid;${item.albumid};${item.label}`
      };
      list.addListItem(listItem);
    });
  } else if (browseIdentifier == "Music Videos") {
    list.addListHeader(browseIdentifier);
    itemsToAdd.map((item) => {
      const listItem = {
        title: item.label,
        label: tools.arrayToString(item.artist),
        thumbnailUri: tools.imageToHttp(kodiInstance, item.thumbnail),
        actionIdentifier: `musicvideoid${item.musicvideoid}`
      };
      list.addListItem(listItem);
    });
  } else if (browseIdentifier.match(/^albumid;[0-9]*;.*$/)) {
    const browseId = browseIdentifier.split(';');
    let albumid = parseInt(browseId[1], 10);
    list.addListHeader(`${browseId[2]}`);
    const aid = tools.j2s({albumid});
    list.addListItem({title:'Play Album',thumbnailUri:images.icon_music, actionIdentifier:`albumid${albumid}`});
    
    itemsToAdd.map((item) => {
      const listItem = {
        title: `${item.track}, ${item.label}`,
        label: tools.arrayToString(item.artist),
        thumbnailUri: tools.imageToHttp(kodiInstance, item.thumbnail),
        actionIdentifier: `songid${item.songid}`
      };
      list.addListItem(listItem);
    });
  }
  return list;
}


function baseListMenu(deviceId){

  const options = {
    title: `Music`,
    totalMatchingItems: 1,
    browseIdentifier: ".",
    offset: 0,
    limit: 10
  };
  const list = neeoapi.buildBrowseList(options);
 
  if (kodiController.kodiReady(deviceId)){
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
      title: "Recent albums",
      thumbnailUri: images.icon_music, 
      browseIdentifier: "Recent albums"
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