const EventEmitter = require('events');
const http = require('http');
const { Transform } = require('stream');

class P2P extends EventEmitter {
  constructor(host) {
    super();
    this.setMaxListeners(0);

    if (!host) throw new Error('no host specified');

    this.host = host;
    this.id = (Math.floor(Math.random() * 1e8)).toString(16);
    this.rooms = new Map();
    this.friends = new Map();
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
      delete this.rooms[roomName];
      room.destroy();
    });

    return room;
  }

  async say(roomName, message = {}) {
    const messageBuf = Buffer.from(JSON.stringify(message));

    const res = http.request({
      hostname: this.host,
      port: 8000,
      path: `/rooms/${roomName}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': messageBuf.length,
      },
    });
    res.write(messageBuf);
    res.end();
  }

  sayHello() {
    const message = {
      event: 'hello',
      peer: this.id,
    };

    this.say('antechamber', message)
      .then(() => {
        setTimeout(() => {
          this.sayHello();
        }, 10000);
      });
  }

  enterServer() {
    const antechamber = this.enterRoom('antechamber');
    antechamber.on('response', (res) => {
      const t = new Transform();
      // eslint-disable-next-line no-underscore-dangle
      t._transform = (message, enc, next) => {
        const messageObj = JSON.parse(message.toString());
        if (!message || messageObj.peer === this.id) return next();

        if (messageObj.event === 'hello') {
          if (!this.friends.has(messageObj.peer)) {
            this.friends.set(messageObj.peer, messageObj.peer);
          }
        }

        return next();
      };

      res.pipe(t);
    });
  }
}

module.export = P2P;

const p2p = new P2P('localhost');
p2p.enterServer();
p2p.sayHello();
