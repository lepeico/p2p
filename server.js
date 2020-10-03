const server = require('http').createServer();
const router = require('./lib/router');

server
  .on('request', (req, res) => {
    router(req, res, server);
  })
  .listen(process.env.PORT || 8000);
