"use strict";
const images = require("../images");
const neeoapi = require("neeo-sdk");
const kodiController = require("../kodi-controller");

const DEFAULT_PATH = ".";

module.exports = {
  browse,
  action
};

function action(deviceId, actionId) {
  if (actionId.indexOf("albumid") > -1) {
    actionId = actionId.replace("albumid", "");
    kodiController.library.playerOpen(deviceId, { albumid: parseInt(actionId, 10) });
  } else if (actionId.indexOf("songid") > -1) {
    actionId = actionId.replace("songid", "");
    kodiController.library.playerOpen(deviceId, { songid: parseInt(actionId, 10) });
  } else if (actionId.indexOf("musicvideoid") > -1) {
    actionId = actionId.replace("musicvideoid", "");
    kodiController.library.playerOpen(deviceId, { musicvideoid: parseInt(actionId, 10) });
  }
}

function browse(devideId, params) {
  const browseIdentifier = params.browseIdentifier || DEFAULT_PATH;
  console.log("BROWSEING", browseIdentifier);

  const listOptions = {
    limit: params.limit || 64,
    offset: params.offset || 0,
    browseIdentifier
  };

  if (browseIdentifier == "Albums") {
    return kodiController.library.getAlbums(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == "Recent albums") {
    return kodiController.library.getLatestAlbums(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == "Music Videos") {
    return kodiController.library.getMusicVideos(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier.match(/^albumid;[0-9]*;.*$/)) {
    const browseId = browseIdentifier.split(";");
    const albumTitle = browseId[2];
    let id = parseInt(browseId[1], 10);
    if (listOptions.offset > 0) {
      listOptions.offset = listOptions.offset - 1; //Fix because 1 item is added to the top for playing the album
    }
    return kodiController.library.getAlbumTracks(devideId, id, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, albumTitle);
    });

    //Base Menu
  } else {
    return baseListMenu(devideId);
  }
}

//////////////////////////////////
// Format Browsing list
function formatList(listItems, listOptions, title) {
  if (listOptions.total < listOptions.limit) {
    listOptions.limit = listOptions.total;
  }

  let browseIdentifier = listOptions.browseIdentifier;

  const options = {
    title: `Browsing ${title}`,
    totalMatchingItems: listItems.length,
    browseIdentifier,
    offset: listOptions.offset || 0,
    limit: listOptions.limit
  };

  const list = neeoapi.buildBrowseList(options);

  console.log("browseIdentifier:", browseIdentifier);

  listItems.map(item => {
    list.addListItem(item);
  });

  return list;
}

function baseListMenu(deviceId) {
  const options = {
    title: `Music`,
    totalMatchingItems: 3,
    browseIdentifier: ".",
    offset: 0,
    limit: 3
  };
  const list = neeoapi.buildBrowseList(options);

  if (kodiController.kodiReady(deviceId)) {
    list.addListHeader("Music");
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
    list.addListHeader("Kodi is not connected");
    list.addListItem({
      title: "Tap to refresh",
      thumbnailUri: images.icon_movie,
      browseIdentifier: "."
    });
  }
  return list;
}
