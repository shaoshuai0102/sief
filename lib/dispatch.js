var plugins = require('./plugins');
var debug = require('debug')('dispatch');
var URL = require('url');

module.exports = function (host, data) {
  var plugin = plugins.load(host);
  if (plugin) {
    debug('Plugin "' + host + '" found');
    plugin.run(data);
  } else {
    debug('Plugin "' + host + '" not found');
  }
};