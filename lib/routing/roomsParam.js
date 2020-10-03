const rooms = {};

module.exports = ({ req, res }, roomName) => {
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
      for (const connection of newRoom.connections) {
        connection.write('connection is live\n');
      }
    }, 15000);
    rooms[roomName] = newRoom;

    newRoom.connections.push(res);
    res.write('connection is live\n');

    res.on('close', () => {
      if (!newRoom.connections.length && roomName === rooms[roomName]) {
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
      if (!rooms[roomName]) return res.end(JSON.stringify({ error: 'room does not exist' }));

      const dataStr = Buffer.concat(dataList).toString();
      // eslint-disable-next-line no-restricted-syntax
      for (const connection of rooms[roomName].connections) {
        connection.write(`${dataStr}\n`);
      }
      res.end();
    });
    return true;
  }

  return roomName;
};
