const EventEmitter = require('events');
const http = require('http');

class P2P extends EventEmitter {
  constructor(host) {
    super();
    if (!host) throw new Error('no host specified');

    this.host = host;
    this.rooms = new Map();
  }

  enterRoom(roomName) {
    const room = http.request({
      hostname: this.host,
      port: 8000,
      path: `/rooms/${roomName}`,
      method: 'GET',
    }).end();

    this.rooms.set(roomName, room);

    room.once('close', () => {
      console.log('bye');
      delete this.rooms[roomName];
      room.destroy();
    });

    return room;
  }

  say(roomName, message = {}) {
    const res = http.request({
      hostname: this.host,
      port: 8000,
      path: `/rooms/${roomName}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': message.length,
      },
    })
    res.write(message);
    res.end();
  }
}

module.export = P2P;
