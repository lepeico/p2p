const EventEmitter = require('events');

class P2P extends EventEmitter {
  constructor(host) {
    super();
    if (!host) throw new Error('no host specified');

    this.host = host;
    this.subscribers = new Map();
  }

  subscribe(channel) {}

  send(channel, message = {}) {}
}

module.export = P2P;
