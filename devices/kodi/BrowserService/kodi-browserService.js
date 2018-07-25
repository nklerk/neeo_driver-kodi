"use strict";
const images = require("../images");
const neeoapi = require("neeo-sdk");
const kodiController = require("../kodi-controller");

const DEFAULT_PATH = ".";

module.exports = {
  browse,
  action
};

function action(deviceId, actionIdentifier) {
  const actionId = actionIdentifier.split(";");
  const action = actionId[0];
  const id = actionId[1];
  const test = { [actionId[0]]: parseInt(actionId[1], 10) };
  kodiController.library.playerOpen(deviceId, { [action]: parseInt(id, 10) });
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
  if (browseIdentifier == ".Movies") {
    return baseListMovieMenu(devideId);
  } else if (browseIdentifier == ".Music") {
    return baseListMusicMenu(devideId);
  } else if (browseIdentifier == ".TVShows") {
    return baseListTVShowsMenu(devideId);
  } else if (browseIdentifier == ".PVR") {
    return baseListPVRMenu(devideId);
  } else if (browseIdentifier == ".Movies.Movies") {
    return kodiController.library.getMovies(devideId, {}, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == ".Movies.MoviesUnwatched") {
    return kodiController.library.getMovies(devideId, { field: "playcount", operator: "is", value: "0" }, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == ".Movies.MoviesWatched") {
    return kodiController.library.getMovies(devideId, { field: "playcount", operator: "greaterthan", value: "0" }, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == ".Movies.Recent Movies") {
    return kodiController.library.getRecentlyAddedMovies(devideId).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == ".Music.Albums") {
    return kodiController.library.getAlbums(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == ".Music.Recent albums") {
    return kodiController.library.getLatestAlbums(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == ".Music.Music Videos") {
    return kodiController.library.getMusicVideos(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == ".TVShows.TV Shows") {
    return kodiController.library.getTVShows(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == ".TVShows.Recent Episodes") {
    return kodiController.library.getRecentEpisodes(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == ".PVR.TV Channels") {
    return kodiController.library.getPvrTvChannels(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == ".PVR.Radio Stations") {
    return kodiController.library.getPvrRadioChannels(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier == ".PVR.Recordings") {
    return kodiController.library.getPvrRecordings(devideId, listOptions.offset, listOptions.limit).then(listItems => {
      listOptions.total = listItems.length;
      return formatList(listItems, listOptions, browseIdentifier);
    });
  } else if (browseIdentifier.match(/^.*;[0-9]*;.*$/)) {
    const browseId = browseIdentifier.split(";");
    const type = browseId[0];
    const id = parseInt(browseId[1], 10);
    const title = browseId[2];
    if (type == "albumid") {
      if (listOptions.offset > 0) {
        listOptions.offset = listOptions.offset - 1; //Fix because 1 item is added to the top for playing the album
      }
      return kodiController.library.getAlbumTracks(devideId, id, listOptions.offset, listOptions.limit).then(listItems => {
        listOptions.total = listItems.length;
        return formatList(listItems, listOptions, title);
      });
    } else if (type == "tvshowid") {
      return kodiController.library.getTVshowEpisodes(devideId, id, listOptions.offset, listOptions.limit).then(listItems => {
        listOptions.total = listItems.length;
        return formatList(listItems, listOptions, title);
      });
    }
  } else {
    return baseListRootMenu(devideId);
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
// Root Menu
function baseListRootMenu(deviceId) {
  const options = {
    title: `Media`,
    totalMatchingItems: 2,
    browseIdentifier: ".",
    offset: 0,
    limit: 2
  };
  const list = neeoapi.buildBrowseList(options);

  if (kodiController.kodiReady(deviceId)) {
    list.addListHeader("Library");
    list.addListItem({
      title: "Movies",
      thumbnailUri: images.icon_movie,
      browseIdentifier: ".Movies"
    });
    list.addListItem({
      title: "Music",
      thumbnailUri: images.icon_music,
      browseIdentifier: ".Music"
    });
    list.addListItem({
      title: "TV Shows",
      thumbnailUri: images.icon_tvshow,
      browseIdentifier: ".TVShows"
    });
    list.addListItem({
      title: "PVR",
      thumbnailUri: images.icon_pvr,
      browseIdentifier: ".PVR"
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

//////////////////////////////////
// Base Movie Menu
function baseListMovieMenu(deviceId) {
  const options = {
    title: `Movies`,
    totalMatchingItems: 4,
    browseIdentifier: ".Movies",
    offset: 0,
    limit: 4
  };
  const list = neeoapi.buildBrowseList(options);

  if (kodiController.kodiReady(deviceId)) {
    list.addListHeader("Movies");
    list.addListItem({
      title: "Movies",
      thumbnailUri: images.icon_movie,
      browseIdentifier: ".Movies.Movies"
    });
    list.addListItem({
      title: "Movies, Unwatched",
      thumbnailUri: images.icon_movie,
      browseIdentifier: ".Movies.MoviesUnwatched"
    });
    list.addListItem({
      title: "Movies, Watched",
      thumbnailUri: images.icon_movie,
      browseIdentifier: ".Movies.MoviesWatched"
    });
    list.addListItem({
      title: "Recent Movies",
      thumbnailUri: images.icon_movie,
      browseIdentifier: ".Movies.Recent Movies"
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

//////////////////////////////////
// Base Music Menu
function baseListMusicMenu(deviceId) {
  const options = {
    title: `Music`,
    totalMatchingItems: 3,
    browseIdentifier: ".Music",
    offset: 0,
    limit: 3
  };
  const list = neeoapi.buildBrowseList(options);

  if (kodiController.kodiReady(deviceId)) {
    list.addListHeader("Music");
    list.addListItem({
      title: "Music Videos",
      thumbnailUri: images.icon_music,
      browseIdentifier: ".Music.Music Videos"
    });
    list.addListItem({
      title: "Albums",
      thumbnailUri: images.icon_music,
      browseIdentifier: ".Music.Albums"
    });
    list.addListItem({
      title: "Recent albums",
      thumbnailUri: images.icon_music,
      browseIdentifier: ".Music.Recent albums"
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

//////////////////////////////////
// Base Music Menu
function baseListTVShowsMenu(deviceId) {
  const options = {
    title: `TV Shows`,
    totalMatchingItems: 2,
    browseIdentifier: ".TVShows",
    offset: 0,
    limit: 2
  };
  const list = neeoapi.buildBrowseList(options);

  if (kodiController.kodiReady(deviceId)) {
    list.addListHeader("TV Shows");
    list.addListItem({
      title: "TV Shows",
      thumbnailUri: images.icon_tvshow,
      browseIdentifier: ".TVShows.TV Shows"
    });
    list.addListItem({
      title: "Recent Episodes",
      thumbnailUri: images.icon_tvshow,
      browseIdentifier: ".TVShows.Recent Episodes"
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

//////////////////////////////////
// Base PVR Menu
function baseListPVRMenu(deviceId) {
  const options = {
    title: `PVR`,
    totalMatchingItems: 2,
    browseIdentifier: ".PVR",
    offset: 0,
    limit: 2
  };
  const list = neeoapi.buildBrowseList(options);

  if (kodiController.kodiReady(deviceId)) {
    list.addListHeader("PVR");
    list.addListItem({
      title: "TV Channels",
      thumbnailUri: images.icon_pvr,
      browseIdentifier: ".PVR.TV Channels"
    });
    list.addListItem({
      title: "Radio Stations",
      thumbnailUri: images.icon_pvr,
      browseIdentifier: ".PVR.Radio Stations"
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
