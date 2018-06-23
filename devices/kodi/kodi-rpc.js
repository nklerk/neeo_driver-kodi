"use strict";

const kodi_rpc = require("node-kodi");

function build(ip, port, user, pass) {
  const _ip = ip;
  const _port = port || "8080";
  const _user = user || "Kodi";
  const _pass = pass || "Kodi";
  return new kodi_rpc({
    url: `${_ip}:${_port}`,
    user: _user,
    password: _pass
  });
}

module.exports = {
  build
};
