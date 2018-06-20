const WebSocket = require("ws");
const EventEmitter = require("events");

class Client {
  constructor(mac, host) {
    this.host = host;
    this.mac = mac;
    this.events = new EventEmitter();
    this.socket;
    this.connect();
  }

  close() {
    this.socket.close();
  }

  connect() {
    let options = {
      host: this.host,
      port: 9090,
      reconnect: false,
      reconnectSleep: 3000,
      connectionTimeout: 10000,
      sendTimeout: 3000
    };
    this.socket = new WebSocket(`ws://${options.host}:${options.port}/jsonrpc`);

    const connectionTimeout = setTimeout(() => {
      this.events.emit("error", { mac: this.mac, eventdata: "Was not able to connect before reaching timeout." });
      setTimeout(() => this.socket.terminate(), 1);
    }, options.connectionTimeout);

    this.socket.on("open", () => {
      clearTimeout(connectionTimeout);
      this.events.emit("connected", { mac: this.mac, eventdata: "Was not able to connect before reaching timeout." });
    });

    this.socket.on("close", () => {
      this.events.emit("closed", { mac: this.mac, eventdata: "Connection closed." });
      if (options.reconnect) {
        setTimeout(() => {
          connect();
        }, options.reconnectSleep);
      }
    });

    this.socket.on("error", error => this.events.emit("error", { mac: this.mac, eventdata: error }));

    this.socket.on("message", message => {
      let data, id, method, params;
      try {
        data = JSON.parse(message);
        if (data.id && sentRequests[data.id] === undefined) {
          this.events.emit("error", { mac: this.mac, eventdata: "Message for unknown id received." });
        }
        let { id, method, params } = data;
      } catch (error) {
        this.events.emit("error", { mac: this.mac, eventdata: error });
        //return
      }
      if (id && sentRequests[id]) {
        sentRequests[id](data);
      } else {
        this.events.emit("notification", { mac: this.mac, eventdata: { method, params } });
      }
    });
  }

  send(method, params) {
    new Promise((resolve, reject) => {
      if (isConnected()) {
        this.events.emit("error", { mac: this.mac, eventdata: "Failed to send message. No connection to kodi." });
      }
      const message = { jsonrpc: "2.0", method, params, id: (jsonrpcId += 1) };
      this.socket.send(JSON.stringify(message), error => {
        if (error) {
          this.events.emit("error", { mac: this.mac, eventdata: error });
        }
        const timeout = setTimeout(() => {
          this.events.emit("error", { mac: this.mac, eventdata: "Failed to send message. No response within timeout." });
          delete sentRequests[message.id];
        }, options.sendTimeout);
        sentRequests[message.id] = ({ id, error, result }) => {
          clearTimeout(timeout);
          delete sentRequests[id];
          if (error) {
            this.events.emit("error", { mac: this.mac, eventdata: error });
          }
          resolve(result);
        };
      });
    });
  }

  isConnected(mac) {
    return this.socket.readyState === WebSocket.OPEN;
  }
}
module.exports = Client;
