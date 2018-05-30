'use strict';
const kodiController = require('./kodi-controller');

module.exports = {
  itemCheck,
  imageToHttp,
  movieTitle,
  episodeTitleA,
  episodeTitleB,
  isProperMac,
  arrayToString,
  s2j,
  j2s
};

function itemCheck (x, items){
	if (x.limits.total > 0) {
		return items;
	} else {
		return [];
	}
}


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


function j2s(json){
  try {
    return JSON.stringify(json);
  } catch (e) {
    console.log ('ERROR function j2s(json)', e);
    return 'ERROR function j2s(json)';
  }
}

function s2j(string){
  try {
    return JSON.parse(string);
  } catch (e) {
    console.log ('ERROR function s2j(string)', e);
    return false;
  }
}