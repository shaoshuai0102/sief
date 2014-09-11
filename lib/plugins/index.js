var plugins = {};
var debug = require('debug')('plugin loader');

module.exports = {
  load: function(name) {
    var plugin = plugins[name];

    if (!plugin) {
      try {
        plugin = plugins[name] = require('./' + name + '.js');
      } catch (e) {
        debug(e);
      }
    }

    return plugin;
  }
};