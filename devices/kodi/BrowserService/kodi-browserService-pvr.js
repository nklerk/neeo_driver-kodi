"use strict";
const images = require("../images");
const neeoapi = require("neeo-sdk");
const kodiController = require("../kodi-controller");
const tools = require("../tools");

const DEFAULT_PATH = ".";

module.exports = {
  browse,
  action
};

function action(deviceId, actionId) {
  if (actionId.indexOf("channelid") > -1) {
    actionId = actionId.replace("channelid", "");
    kodiController.library.playerOpen(deviceId, { channelid: parseInt(actionId, 10) });
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

  if (browseIdentifier == "TV Channels") {
    return kodiController.library.getPvrTvChannels(devideId, listOptions.offset, listOptions.limit).then(x => {
      const list = tools.itemCheck(x, "channels");
      listOptions.total = list.total;
      return formatList(devideId, list.items, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == "Radio Stations") {
    return kodiController.library.getPvrRadioChannels(devideId, listOptions.offset, listOptions.limit).then(x => {
      const list = tools.itemCheck(x, "channels");
      listOptions.total = list.total;
      return formatList(devideId, list.items, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == "Recordings") {
    return kodiController.library.getPvrRecordings(devideId, listOptions.offset, listOptions.limit).then(x => {
      const list = tools.itemCheck(x, "recordings");
      listOptions.total = list.total;
      return formatList(devideId, list.items, listOptions, browseIdentifier);
    });
  } else {
    return baseListMenu(devideId);
  }
}

//////////////////////////////////
// Format Browsing list
function formatList(deviceId, listItems, listOptions, title) {
  if (listOptions.total < listOptions.limit) {
    listOptions.limit = listOptions.total;
  }

  let browseIdentifier = listOptions.browseIdentifier;

  const options = {
    title: `Browsing ${title}`,
    totalMatchingItems: listItems.length,
    browseIdentifier,
    offset: listOptions.offset,
    limit: listOptions.limit
  };

  const list = neeoapi.buildBrowseList(options);
  const itemsToAdd = list.prepareItemsAccordingToOffsetAndLimit(listItems);
  const kodiInstance = kodiController.getKodi(deviceId);

  console.log("browseIdentifier:", browseIdentifier);

  if (browseIdentifier == "TV Channels" || browseIdentifier == "Radio Stations") {
    itemsToAdd.map(item => {
      if (item.hidden == false) {
        let broadcastnowTitle = "";
        if (typeof item.broadcastnow != "undefined" && typeof item.broadcastnow.title != "undefined") {
          broadcastnowTitle = item.broadcastnow.title;
        }
        const listItem = {
          title: item.label,
          label: broadcastnowTitle,
          thumbnailUri: tools.imageToHttp(kodiInstance, item.thumbnail),
          actionIdentifier: `channelid${item.channelid}`
        };
        list.addListItem(listItem);
      }
    });
  } else if (browseIdentifier == "Recordings") {
    const listItem = {
      title: item.label,
      label: broadcastnowTitle,
      thumbnailUri: tools.imageToHttp(kodiInstance, item.thumbnail),
      actionIdentifier: `channelid${item.channelid}`
    };
    list.addListItem(listItem);
  }
  return list;
}

function baseListMenu(deviceId) {
  const options = {
    title: `Music`,
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
