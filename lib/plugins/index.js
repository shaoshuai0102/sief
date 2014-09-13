var plugins = {};
var debug = require('debug')('plugin loader');
var path = require('path');
var chokidar = require('chokidar');

var watcher = chokidar.watch(process.cwd() + '/lib/plugins', {
  ignored: function (p) {
    var relative_path = path.relative(process.cwd() + '/lib/plugins', p);
    return /(index.js)|\//.test(relative_path);
  },
  persistent: false
});

watcher
    .on('add', function (path, stat) {
      debug(path + ' added');
      loadPlugin(path);
    })
    .on('change', function (path, stat) {
      debug(path + ' changed');
      loadPlugin(path);
    })
    .on('unlink', function (path, stat) {
      debug(path + ' deleted');
      unloadPlugin(path);
    })
    .on('error', function(error) {
      debug('Error happened', error);
    });

function loadPlugin (file) {
  var plugin;

  var pluginName = path.basename(file, '.js');

  try {
    delete require.cache[require.resolve('./' + pluginName)];

    plugin = require('./' + pluginName);
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

function unloadPlugin(file) {
  var pluginName = path.basename(file, '.js');

  if (plugins[pluginName])
    debug('Plugin ' + pluginName + ' unloaded');

  delete plugins[pluginName];
}

module.exports = {
  getPlugin: function (name) {
    return plugins[name];
  }
};