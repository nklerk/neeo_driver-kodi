"use strict";

module.exports = {
  itemCheck,
  imageToHttp,
  movieTitle,
  isProperMac,
  arrayToString,
  s2j,
  j2s
};

function itemCheck(x, items) {
  let list = [];
  if (typeof x != "undefined" && x.limits && x.limits.total > 0) {
    list = x[items];
  }
  return list;
}

function imageToHttp(kodiInstance, uri) {
  return `http://${kodiInstance.ws.username}:${kodiInstance.ws.password}@${kodiInstance.ws.options.host}:${kodiInstance.ws.httpPort}/vfs/` + encodeURIComponent(uri);
}

function movieTitle(movie) {
  const year = " (" + movie.year + ")" || "";
  return movie.label + year;
}

function episodeTitleB(item) {
  return `${item.season}-${item.episode},  ${item.title}`;
}

function isProperMac(mac) {
  if (mac.match(/^[0-9a-fA-F][0-9a-fA-F]:[0-9a-fA-F][0-9a-fA-F]:[0-9a-fA-F][0-9a-fA-F]:[0-9a-fA-F][0-9a-fA-F]:[0-9a-fA-F][0-9a-fA-F]:[0-9a-fA-F][0-9a-fA-F]$/)) {
    return true;
  } else {
    return false;
  }
}

function arrayToString(arr) {
  let ret = "";
  for (let i in arr) {
    ret = ret + arr[i];
    if (i + 1 != arr.length) {
      ret = ret + ", ";
    }
  }
  return ret;
}

function j2s(json) {
  try {
    return JSON.stringify(json);
  } catch (e) {
    console.log("ERROR function j2s(json)", e);
    return "ERROR function j2s(json)";
  }
}

function s2j(string) {
  try {
    return JSON.parse(string);
  } catch (e) {
    console.log("ERROR function s2j(string)", e);
    return false;
  }
}
