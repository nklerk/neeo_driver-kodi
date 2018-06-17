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

function action(deviceId, movieId) {
  console.log("Now starting movie with movieid:", movieId);
  kodiController.library.playerOpen(deviceId, { movieid: parseInt(movieId, 10) });
}

function browse(devideId, params) {
  let browseIdentifier = params.browseIdentifier || DEFAULT_PATH;
  const listOptions = {
    limit: params.limit || 64,
    offset: params.offset || 0,
    browseIdentifier
  };


  console.log("listOptions.offset", listOptions.offset);

  //If Movies
  if (browseIdentifier == "Movies") {
    return kodiController.library.getMovies(devideId, {}, listOptions.offset, listOptions.limit).then((x) => {
      const listItems = tools.itemCheck(x, x.movies);
      listOptions.total = x.limits.total
      return formatList(devideId, listItems, listOptions);
    });

    //If Recent Movies
  } else if (browseIdentifier == "MoviesUnwatched") {
    return kodiController.library.getMovies(devideId, { "field": "playcount", "operator": "is", "value": "0" }, listOptions.offset, listOptions.limit).then((x) => {
      const listItems = tools.itemCheck(x, x.movies);
      listOptions.total = x.limits.total
      return formatList(devideId, listItems, listOptions);
    });

    //If Recent Movies
  } else if (browseIdentifier == "MoviesWatched") {
    return kodiController.library.getMovies(devideId, { "field": "playcount", "operator": "greaterthan", "value": "0" }, listOptions.offset, listOptions.limit).then((x) => {
      const listItems = tools.itemCheck(x, x.movies);
      listOptions.total = x.limits.total
      return formatList(devideId, listItems, listOptions);
    });

    //If Recent Movies
  } else if (browseIdentifier == "Recent Movies") {
    return kodiController.library.getRecentlyAddedMovies(devideId).then((x) => {
      const listItems = tools.itemCheck(x, x.movies);
      listOptions.total = 30
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
  let browseIdentifier = listOptions.browseIdentifier;
  const options = {
    title: `Browsing ${browseIdentifier}`,
    totalMatchingItems: listOptions.total,
    browseIdentifier,
    offset: listOptions.offset,
    limit: listOptions.limit,
  };

  const list = neeoapi.buildBrowseList(options);
  //const itemsToAdd = list.prepareItemsAccordingToOffsetAndLimit(listItems);
  const itemsToAdd = listItems;
  const kodiInstance = kodiController.getKodi(deviceId);


  console.log("browseIdentifier:", browseIdentifier);



  itemsToAdd.map((item) => {
    const listItem = {
      title: tools.movieTitle(item),
      label: tools.arrayToString(item.genre),
      thumbnailUri: tools.imageToHttp(kodiInstance, item.thumbnail),
      actionIdentifier: `${item.movieid}`
    };
    list.addListItem(listItem);
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
    list.addListHeader('Movies');
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
    list.addListHeader('Kodi is not connected');
    list.addListItem({
      title: "Tap to refresh",
      thumbnailUri: images.icon_movie,
      browseIdentifier: '.'
    });
  }
  return list;
}