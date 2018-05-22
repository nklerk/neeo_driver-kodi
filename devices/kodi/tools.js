'use strict';
const kodiController = require('./kodi-controller');

module.exports = {
  imageToHttp,
  movieTitle,
  episodeTitleA,
  episodeTitleB,
  isProperMac,
  arrayToString
};

function imageToHttp (kodiInstance, uri) {
  return `http://${kodiInstance.ip}:${kodiInstance.port}/image/`+encodeURIComponent(uri);
}

function movieTitle (movie) {
  const year = ' ('+movie.year+')' || '';
  return movie.label+year;
}

function episodeTitleA (item) {
  return `${item.season}-${item.episode},  ${item.showtitle}`;
}

function episodeTitleB (item) {
  return `${item.season}-${item.episode},  ${item.title}`;
}

function isProperMac (mac){
  if (mac.match(/^[0-9a-fA-F][0-9a-fA-F]:[0-9a-fA-F][0-9a-fA-F]:[0-9a-fA-F][0-9a-fA-F]:[0-9a-fA-F][0-9a-fA-F]:[0-9a-fA-F][0-9a-fA-F]:[0-9a-fA-F][0-9a-fA-F]$/)){
    return true;
  } else {
    return false;
  }
}

function arrayToString (arr){
  let ret = '';
  for (let i in arr){
    ret = ret + arr[i];
    if (i+1 != arr.length){
      ret = ret + ', ';
    }
  }
  return ret;
}