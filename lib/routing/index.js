const { name, version } = require('../../package');
const roomsParamHandler = require('./roomsParam');

module.exports = {
  '/': () => JSON.stringify({ name, version }),
  '/rooms/:room': roomsParamHandler,
};
