const WebSocket = require("ws");
const EventEmitter = require("events");

let connected = false;
let events = [];
let jsonrpcId = 0;
let socket = [];

const sentRequests = Object.create(null);
rpcws.prototype.con = connect;

function rpcws(mac, host) {
  this.mac = mac;
  this.host = host;
  this.events = new EventEmitter();

  console.log("CONNECTING RPC WS : 9090", this.host, this.mac);

  rpcws.con(mac, host);
  //this.send = send;
  //this.events = events[mac];
  //this.isConnected = isConnected;
}
//rpcws.prototype.con = connect;

function setOptions() {
  return {
    host: "localhost",
    mac: "",
    port: 9090,
    reconnect: false,
    reconnectSleep: 3000,
    connectionTimeout: 10000,
    sendTimeout: 3000
  };
}

function close(mac) {
  socket[mac].close();
}

function connect() {
  let mac = this.mac;
  let host = this.host;
  let options = setOptions();
  options.host = host;
  //options.mac = mac;
  socket[mac] = new WebSocket(`ws://${options.host}:${options.port}/jsonrpc`);
  const connectionTimeout = setTimeout(() => {
    events[mac].emit(
      "error",
      evBuild("Was not able to connect before reaching timeout.")
    );
    setTimeout(() => socket[mac].terminate(), 1);
  }, options.connectionTimeout);
  socket[mac].on("open", () => {
    clearTimeout(connectionTimeout);
    events[mac].emit(
      "connected",
      evBuild("Was not able to connect before reaching timeout.")
    );
  });
  socket[mac].on("close", () => {
    events[mac].emit("closed", evBuild(mac, "Connection closed."));
    if (options.reconnect) {
      setTimeout(() => {
        connect(
          mac,
          host
        );
      }, options.reconnectSleep);
    }
  });
  socket[mac].on("error", error =>
    events[mac].emit("error", evBuild(mac, error))
  );
  socket[mac].on("message", message => {
    let data, id, method, params; //bugfix?!
    try {
      data = JSON.parse(message);
      if (data.id && sentRequests[data.id] === undefined) {
        events[mac].emit(
          "error",
          evBuild(mac, "Message for unknown id received.")
        );
      }
      let { id, method, params } = data;
    } catch (error) {
      events[mac].emit("error", evBuild(mac, error));
      //return
    }
    if (id && sentRequests[id]) {
      sentRequests[id](data);
    } else {
      events[mac].emit("notification", evBuild(mac, { method, params }));
    }
  });
}

function send(mac, method, params) {
  new Promise((resolve, reject) => {
    if (isConnected()) {
      events[mac].emit(
        "error",
        evBuild("Failed to send message. No connection to kodi.")
      );
    }
    const message = { jsonrpc: "2.0", method, params, id: (jsonrpcId += 1) };
    socket[mac].send(JSON.stringify(message), error => {
      if (error) {
        events[mac].emit("error", evBuild(mac, error));
      }
      const timeout = setTimeout(() => {
        events[mac].emit(
          "error",
          evBuild("Failed to send message. No response within timeout.")
        );
        delete sentRequests[message.id];
      }, options.sendTimeout);
      sentRequests[message.id] = ({ id, error, result }) => {
        clearTimeout(timeout);
        delete sentRequests[id];
        if (error) {
          events[mac].emit("error", evBuild(mac, error));
        }
        resolve(result);
      };
    });
  });
}

function evBuild(mac, param) {
  const evData = {
    mac,
    eventdata: param
  };
  return evData;
}

function isConnected(mac) {
  return socket[mac].readyState === WebSocket.OPEN;
}

module.exports = {
  rpcws
};
