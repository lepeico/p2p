const rooms = {};

module.exports = ({ req, res }, roomName) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    if (!rooms[roomName]) {
      const newRoom = {
        connections: [],
        live: null,
      };
      newRoom.live = setInterval(() => {
        // eslint-disable-next-line
        for (const connection of newRoom.connections) {
          connection.write(JSON.stringify({ event: 'serverStatus', message: 'room is open' }));
        }
      }, 15000);
      rooms[roomName] = newRoom;
    }

    const room = rooms[roomName];
    const resI = room.connections.length;
    room.connections.push(res);
    res.write(JSON.stringify({ event: 'enterRoom', message: 'welcome' }));

    res.on('close', () => {
      room.connections.splice(resI, 1);
      if (!room.connections.length) {
        clearInterval(roomName.live);
        delete rooms[roomName];
      }
    });

    res.flushHeaders();
    return true;
  }

  if (req.method === 'POST') {
    const dataList = [];
    req.on('data', (data) => {
      dataList.push(data);
    });

    req.on('end', () => {
      if (!rooms[roomName]) return res.end(JSON.stringify({ error: 'no one in this room' }));

      const dataStr = Buffer.concat(dataList).toString();
      // eslint-disable-next-line no-restricted-syntax
      for (const connection of rooms[roomName].connections) {
        connection.write(`${dataStr}\n`);
      }
      res.end();
      return null;
    });
    return true;
  }

  return roomName;
};
