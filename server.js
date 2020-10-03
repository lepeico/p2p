const server = require('http').createServer();
const router = require('./lib/router');

server.on('request', (req, res) => { router(req, res, server); }).listen(8000);
