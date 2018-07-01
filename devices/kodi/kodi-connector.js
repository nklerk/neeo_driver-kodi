"use strict";

const WebSocket = require("ws");
const EventEmitter = require("events");
const tools = require("./tools");
const images = require("./images");

let jsonrpcId = 0;
let sentRequests = [];

const RPC_PORT = 9090;

class Client {
  constructor(mac, host, httpPort, username, password) {
    this.options = {
      host,
      port: RPC_PORT,
      reconnect: false,
      reconnectSleep: 3000,
      connectionTimeout: 10000,
      sendTimeout: 9000
    };
    this.httpPort = httpPort;
    this.username = username;
    this.password = password;
    this.session = false;
    this.mac = mac;
    this.events = new EventEmitter();
    this.socket;
    this.volume = 100;
    this.nowPlayingLabel = "";
    this.nowPlayingImg = images.logo_KODI_tp;
  }

  close() {
    this.session = false;
    this.socket.close();
  }

  connect() {
    if (!this.session) {
      this.session = true;

      console.log(`Driver connectiong to ${this.options.host}:${this.options.port}`);
      this.socket = new WebSocket(`ws://${this.options.host}:${this.options.port}/jsonrpc`);

      const connectionTimeout = setTimeout(() => {
        console.log("Was not able to connect before reaching timeout.");
        setTimeout(() => this.socket.terminate(), 1);
      }, this.options.connectionTimeout);

      this.socket.on("open", () => {
        clearTimeout(connectionTimeout);
        this.events.emit("connected", { mac: this.mac, eventdata: "Was not able to connect before reaching timeout." });
      });

      this.socket.on("close", () => {
        this.session = false;
        this.events.emit("closed", { mac: this.mac, eventdata: "Connection closed." });
        if (this.options.reconnect) {
          setTimeout(() => {
            this.connect();
          }, this.options.reconnectSleep);
        }
      });

      this.socket.on("error", error => {
        console.log("SOCKET ERROR:", error);
        this.close();
      });

      this.socket.on("message", message => {
        let data, id, method, params;
        try {
          data = JSON.parse(message);
          id = data.id;
          method = data.method;
          params = data.params;
          if (data.id && sentRequests[data.id] === undefined) {
            console.log("ID ERROR: Message for unknown id received.");
          }
        } catch (error) {
          console.log("MESSAGE ERROR:", error);
          this.close();
        }
        if (id && sentRequests[id]) {
          sentRequests[id](data);
        } else {
          handleKodiEvents(this, method, params);
        }
      });
    }
  }

  send(method, params) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        this.connect();
      }
      const message = { jsonrpc: "2.0", method, params, id: (jsonrpcId += 1) };
      this.socket.send(JSON.stringify(message), error => {
        if (error) {
          //this.events.emit("error", { mac: this.mac, eventdata: error });
        }
        const timeout = setTimeout(() => {
          console.log("Failed to send message. No response within timeout.");
          delete sentRequests[message.id];
        }, this.options.sendTimeout);
        sentRequests[message.id] = ({ id, error, result }) => {
          clearTimeout(timeout);
          delete sentRequests[id];
          if (error) {
            //this.events.emit("error", { mac: this.mac, eventdata: error });
          }
          resolve(result);
        };
      });
    });
  }

  isConnected() {
    if (!this.session || typeof this.socket === "undefined") {
      return false;
    } else {
      return this.socket.readyState === WebSocket.OPEN;
    }
  }
}
module.exports = Client;

function handleKodiEvents(kodi, method, params) {
  if (method === "Application.OnVolumeChanged") {
    kodi.volume = params.data.volume;
    kodi.events.emit("notification", { mac: kodi.mac, type: "VolumeChanged", volume: params.data.volume });
  }
  if (method === "Player.OnPlay" && (params.data.item.type === "movie" || params.data.item.type === "musicvideo")) {
    kodi.send("Player.GetItem", { playerid: params.data.player.playerid, properties: ["thumbnail", "title", "year"] }).then(y => {
      kodi.nowPlayingLabel = tools.movieTitle({ label: y.item.title, year: y.item.year });
      kodi.nowPlayingImg = tools.imageToHttp({ ws: kodi }, y.item.thumbnail);
      kodi.events.emit("notification", { mac: kodi.mac, type: "PlayingChanged", title: kodi.nowPlayingLabel, image: kodi.nowPlayingImg });
    });
  }
  if (method === "Player.OnPlay" && params.data.item.type === "song") {
    kodi.send("Player.GetItem", { playerid: params.data.player.playerid, properties: ["thumbnail", "title", "artist"] }).then(y => {
      kodi.nowPlayingLabel = `${y.item.title}, ${y.item.artist}`;
      kodi.nowPlayingImg = tools.imageToHttp({ ws: kodi }, y.item.thumbnail);
      kodi.events.emit("notification", { mac: kodi.mac, type: "PlayingChanged", title: kodi.nowPlayingLabel, image: kodi.nowPlayingImg });
    });
  }
  if (method === "Player.OnPlay" && params.data.item.type === "episode") {
    kodi.send("Player.GetItem", { playerid: params.data.player.playerid, properties: ["art", "title", "showtitle"] }).then(y => {
      kodi.nowPlayingLabel = `${y.item.showtitle}, ${y.item.title}`;
      kodi.nowPlayingImg = tools.imageToHttp({ ws: kodi }, y.item.art["tvshow.poster"]);
      kodi.events.emit("notification", { mac: kodi.mac, type: "PlayingChanged", title: kodi.nowPlayingLabel, image: kodi.nowPlayingImg });
    });
  }
  if (method === "Player.OnStop") {
    kodi.nowPlayingLabel = "";
    kodi.nowPlayingImg = "";
    kodi.events.emit("notification", { mac: kodi.mac, type: "PlayingChanged", title: "", image: images.logo_KODI_tp });
  }
}

function getMac(host) {
  return new Promise((resolve, reject) => {
    let ws = new WebSocket(`ws://${host}:${RPC_PORT}/jsonrpc`);
    const to = setTimeout(() => {
      ws.close();
      reject("Failed to send message. No response within timeout.");
    }, 5000);

    ws.on("open", () => {
      sendMacRequest(ws, host);
    });

    ws.on("message", message => {
      let data, id, result;
      try {
        data = JSON.parse(message);
        id = data.id;
        result = data.result["Network.MacAddress"];
      } catch (error) {
        //console.log("MESSAGE ERROR:", error);
      }
      if (id == `MAC${host}`) {
        if (tools.isProperMac(result)) {
          ws.close;
          clearTimeout(to);
          resolve(result);
        } else {
          sendMacRequest(ws, host);
        }
      }
    });
  });
}
module.exports.getMac = getMac;

function sendMacRequest(ws, host) {
  const getMacContent = { jsonrpc: "2.0", method: "XBMC.GetInfoLabels", params: { labels: ["Network.MacAddress"] }, id: `MAC${host}` };
  ws.send(JSON.stringify(getMacContent), error => {
    if (error) {
      console.log("ERROR getting MAC");
    }
  });
}
