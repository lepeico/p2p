const rooms = {};

module.exports = ({ req, res }, roomName, server) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const newRoom = {
      connections: [],
      live: null,
    };
    newRoom.live = setInterval(() => {
      // eslint-disable-next-line
      for (let connection of newRoom.connections) {
        connection.write('room is alive\n');
      }
    }, 1000);
    rooms[roomName] = newRoom;

    server.emit('connect', roomName);
    newRoom.connections.push(res);

    res.on('close', () => {
      if (!newRoom.connections.length && roomName === rooms[roomName]) {
        clearInterval(roomName.live);
        delete rooms[roomName];
      }
    });

    res.flushHeaders();
    return true;
  }

  return roomName;
};
