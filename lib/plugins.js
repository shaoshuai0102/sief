var plugins = {};
var debug = require('debug')('plugin loader');
var path = require('path');
var chokidar = require('chokidar');



function loadPlugin(plugin) {
  if (plugin instanceof Array) {
    plugin.forEach(function (v) {
      loadPlugin(v);
    });
    return;
  }

  var watcher = chokidar.watch(plugin, {
    persistent: false,
    ignored: function (path) {
      return /node_modules|package.json/.test(path);
    }
  });
  watcher
      .on('add', function (path, stat) {
        debug(path + ' added');
        _loadPlugin(path);
      })
      .on('change', function (path, stat) {
        debug(path + ' changed');
        _loadPlugin(path);
      })
      .on('unlink', function (path, stat) {
        debug(path + ' deleted');
        _unloadPlugin(path);
      })
      .on('error', function(error) {
        debug('Error happened', error);
      });

}


function _loadPlugin (file) {
  var plugin;

  var pluginName = path.basename(file, '.js');

  try {
    delete require.cache[file];

    plugin = require(file);
  } catch (e) {
    debug(e);
    return;
  }

  if (plugin) {

    if (!plugin.run) {
      plugin = null;
      debug('Invalid plugin: run method not found');
      return;
    }

    debug('Plugin ' + pluginName + (plugins[pluginName] ? ' reloaded' : ' loaded'));

    plugins[pluginName] = plugin;
  }

  return plugin;
}

function _unloadPlugin(file) {
  var pluginName = path.basename(file, '.js');

  if (plugins[pluginName])
    debug('Plugin ' + pluginName + ' unloaded');

  delete plugins[pluginName];
}

module.exports = {
  getPlugin: function (name) {
    return plugins[name];
  },

  loadPlugin: loadPlugin
};