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

function action (deviceId, episodeId){
  console.log ("Now starting episode with episodeid:",episodeId);
  kodiController.library.playerOpen(deviceId,{episodeid: parseInt(episodeId, 10)});
}

function browse(devideId, params) {
  const browseIdentifier = params.browseIdentifier || DEFAULT_PATH;
  console.log ("BROWSEING", browseIdentifier);
  const listOptions = {
    limit: params.limit,
    offset: params.offset,
    browseIdentifier,
  };

  if (browseIdentifier == "TV Shows"){
    return kodiController.library.getTVShows(devideId).then((listItems)=>{
      return formatList(devideId, listItems, listOptions, "TV Shows");
    });


  } else if (browseIdentifier == "Recent Episodes") {
    return kodiController.library.getRecentEpisodes(devideId).then((listItems)=>{
      return formatList(devideId, listItems, listOptions, "Recent Episodes");
    }); 

  } else if (browseIdentifier.match(/^tvshowid;[0-9]*;.*$/)) {
    const browseId = browseIdentifier.split(';');
    console.log ("DEBUG:", browseId);
    let id = parseInt(browseId[1], 10);
    console.log ("DEBUG:", id);
    return kodiController.library.getTVshowEpisodes(devideId, id).then((listItems)=>{
      return formatList(devideId, listItems, listOptions, browseId[2]);
    }); 
    
  //Base Menu
  } else {
    return baseListMenu(devideId);
  }
}

//////////////////////////////////
// Format Browsing list
function formatList(deviceId, listItems, listOptions, title) {
  const options = {
    title: `Browsing ${title}`,
    totalMatchingItems: listItems.length,
    browseIdentifier: listOptions.browseIdentifier,
    offset: listOptions.offset,
    limit: listOptions.limit,
  };

  const list = neeoapi.buildBrowseList(options);
  const itemsToAdd = list.prepareItemsAccordingToOffsetAndLimit(listItems);
  const kodiInstance = kodiController.getKodi(deviceId);

  console.log ("listOptions.browseIdentifier:", options.browseIdentifier);

  list.addListHeader(title);
  if (listOptions.browseIdentifier == "TV Shows"){
    itemsToAdd.map((item) => {
      const listItem = {
        title: item.label,
        thumbnailUri: tools.imageToHttp(kodiInstance, item.thumbnail),
        browseIdentifier: `tvshowid;${item.tvshowid};${item.label}`
      };
      list.addListItem(listItem);
    });
  } else if (listOptions.browseIdentifier == "Recent Episodes") {
    itemsToAdd.map((item) => {
      const listItem = {
        title: tools.episodeTitleA(item),
        thumbnailUri: tools.imageToHttp(kodiInstance, item.art.thumb),
        actionIdentifier: `${item.episodeid}`
      };
      list.addListItem(listItem);
    });
  } else {
    itemsToAdd.map((item) => {
      const listItem = {
        title: tools.episodeTitleB(item),
        thumbnailUri: tools.imageToHttp(kodiInstance, item.art.thumb),
        actionIdentifier: `${item.episodeid}`
      };
      list.addListItem(listItem);
    });
  }
  return list;
}


function baseListMenu(deviceId){

  const options = {
    title: `TV Shows`,
    totalMatchingItems: 1,
    browseIdentifier: ".",
    offset: 0,
    limit: 10
  };
  const list = neeoapi.buildBrowseList(options);
 
  if (kodiController.kodiReady(deviceId)){
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
