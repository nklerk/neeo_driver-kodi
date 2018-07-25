"use strict";
const images = require("../images");
const neeoapi = require("neeo-sdk");
const kodiController = require("../kodi-controller");

const DEFAULT_PATH = ".";

module.exports = {
  browse,
  action
};

function action(deviceId, movieId) {
  console.log("Now starting movie with movieid:", movieId);
  kodiController.library.playerOpen(deviceId, { movieid: parseInt(movieId, 10) });
}

function browse(devideId, params) {
  const browseIdentifier = params.browseIdentifier || DEFAULT_PATH;
  console.log("BROWSEING", browseIdentifier);

  const listOptions = {
    limit: params.limit || 64,
    offset: params.offset || 0,
    browseIdentifier
  };

  //If Movies
  if (browseIdentifier == "Movies") {
    return kodiController.library.getMovies(devideId, {}, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });

    //If Recent Movies
  } else if (browseIdentifier == "MoviesUnwatched") {
    return kodiController.library.getMovies(devideId, { field: "playcount", operator: "is", value: "0" }, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });

    //If Recent Movies
  } else if (browseIdentifier == "MoviesWatched") {
    return kodiController.library.getMovies(devideId, { field: "playcount", operator: "greaterthan", value: "0" }, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });

    //If Recent Movies
  } else if (browseIdentifier == "Recent Movies") {
    return kodiController.library.getRecentlyAddedMovies(devideId).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
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

//////////////////////////////////
// Base Movie Menu
function baseListMenu(deviceId) {
  const options = {
    title: `Movies`,
    totalMatchingItems: 2,
    browseIdentifier: ".",
    offset: 0,
    limit: 2
  };
  const list = neeoapi.buildBrowseList(options);

  if (kodiController.kodiReady(deviceId)) {
    list.addListHeader("Movies");
    list.addListItem({
      title: "Movies",
      thumbnailUri: images.icon_movie,
      browseIdentifier: "Movies"
    });
    list.addListItem({
      title: "Movies, Unwatched",
      thumbnailUri: images.icon_movie,
      browseIdentifier: "MoviesUnwatched"
    });
    list.addListItem({
      title: "Movies, Watched",
      thumbnailUri: images.icon_movie,
      browseIdentifier: "MoviesWatched"
    });
    list.addListItem({
      title: "Recent Movies",
      thumbnailUri: images.icon_movie,
      browseIdentifier: "Recent Movies"
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
