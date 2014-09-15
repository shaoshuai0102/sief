var plugins = require('./plugins');
var logger = require('log4js').getLogger('dispatch');
var URL = require('url');

module.exports = function (host, data) {
  var plugin = plugins.getPlugin(host);
  if (plugin) {
    logger.info('Plugin "' + host + '" found');
    plugin.run(data);
  } else {
    logger.info('Plugin "' + host + '" not found');
  }
};