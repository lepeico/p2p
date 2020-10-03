const { name, version } = require('../../package');
const roomsParamHandler = require('./roomsParam');

const routes = {
  '/': () => JSON.stringify({ name, version }),
  '/rooms/:room': roomsParamHandler,
};

module.exports = routes;
