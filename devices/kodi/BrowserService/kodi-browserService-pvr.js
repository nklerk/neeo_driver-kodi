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
  if (actionId.indexOf("channelid") > -1) {
    actionId = actionId.replace("channelid", "");
    kodiController.library.playerOpen(deviceId, { channelid: parseInt(actionId, 10) });
  } else if (actionId.indexOf("recordingid") > -1) {
    actionId = actionId.replace("recordingid", "");
    kodiController.library.playerOpen(deviceId, { recordingid: parseInt(actionId, 10) });
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

  if (browseIdentifier == "TV Channels") {
    return kodiController.library.getPvrTvChannels(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == "Radio Stations") {
    return kodiController.library.getPvrRadioChannels(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == "Recordings") {
    return kodiController.library.getPvrRecordings(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
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
    title: `PVR`,
    totalMatchingItems: 2,
    browseIdentifier: ".",
    offset: 0,
    limit: 2
  };
  const list = neeoapi.buildBrowseList(options);

  if (kodiController.kodiReady(deviceId)) {
    list.addListHeader("PVR");
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
