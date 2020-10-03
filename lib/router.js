const routing = require('./routing');

module.exports = (req, res, server) => {
  let ret;
  // eslint-disable-next-line
  for (const route in routing) {
    const routeRX = new RegExp(`^${route.replace(/:[^\s/]+/g, '([\\w-]+)')}$`);

    const found = req.url.match(routeRX);
    if (found) {
      ret = routing[route]({ req, res }, found[1], server);
      break;
    }
  }
  if (ret) {
    if (typeof ret === 'string') res.end(ret);
  } else {
    res.end(JSON.stringify({ error: '404' }));
  }
};
