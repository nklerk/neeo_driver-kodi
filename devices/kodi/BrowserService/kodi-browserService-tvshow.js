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
    limit: params.limit || 64,
    offset: params.offset || 0,
    browseIdentifier
  };

  if (browseIdentifier == "TV Shows"){
    return kodiController.library.getTVShows(devideId, listOptions.offset, listOptions.limit).then((x)=>{
      const listItems = tools.itemCheck(x, x.tvshows);
      listOptions.total = x.limits.total
      return formatList(devideId, listItems, listOptions, "TV Shows");
    });


  } else if (browseIdentifier == "Recent Episodes") {
    return kodiController.library.getRecentEpisodes(devideId, listOptions.offset, listOptions.limit).then((x)=>{
      const listItems = tools.itemCheck(x, x.episodes);
      listOptions.total = x.limits.total
      return formatList(devideId, listItems, listOptions, "Recent Episodes");
    }); 

  } else if (browseIdentifier.match(/^tvshowid;[0-9]*;.*$/)) {
    const browseId = browseIdentifier.split(';');
    let id = parseInt(browseId[1], 10);
    return kodiController.library.getTVshowEpisodes(devideId, id, listOptions.offset, listOptions.limit).then((x)=>{
      const listItems = tools.itemCheck(x, x.episodes);
      listOptions.total = x.limits.total
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

  console.log ("listOptions.browseIdentifier:", browseIdentifier);

  if (browseIdentifier == "TV Shows"){
    itemsToAdd.map((item) => {
      const listItem = {
        title: item.label,
        thumbnailUri: tools.imageToHttp(kodiInstance, item.thumbnail),
        browseIdentifier: `tvshowid;${item.tvshowid};${item.label}`
      };
      list.addListItem(listItem);
    });
  } else if (browseIdentifier == "Recent Episodes") {
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
        title: item.title,
        label: `Season: ${item.season}, Episode: ${item.episode}`,
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
    totalMatchingItems: 2,
    browseIdentifier: ".",
    offset: 0,
    limit: 2
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
