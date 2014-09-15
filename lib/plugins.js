var plugins = {};
var logger = require('log4js').getLogger('pluginLoader');
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
    ignored: function (file) {
      var extname = path.extname(file);
      var ignored = /node_modules|package.json/.test(file) || (extname && extname != '.js');
      logger.debug('ignored', ignored, file);
      return ignored;
    }
  });
  watcher
      .on('add', function (path, stat) {
        logger.info(path + ' added');
        _loadPlugin(path);
      })
      .on('change', function (path, stat) {
        logger.info(path + ' changed');
        _loadPlugin(path);
      })
      .on('unlink', function (path, stat) {
        logger.info(path + ' deleted');
        _unloadPlugin(path);
      })
      .on('error', function(error) {
        logger.error('Error happened', error);
      });

}


function _loadPlugin (file) {
  var plugin;

  var pluginName = path.basename(file, '.js');

  try {
    delete require.cache[file];

    plugin = require(file);
  } catch (e) {
    logger.error(e);
    return;
  }

  if (plugin) {

    if (!plugin.run) {
      plugin = null;
      logger.error('Invalid plugin: run method not found');
      return;
    }

    logger.info('Plugin ' + pluginName + (plugins[pluginName] ? ' reloaded' : ' loaded'));

    plugins[pluginName] = plugin;
  }

  return plugin;
}

function _unloadPlugin(file) {
  var pluginName = path.basename(file, '.js');

  if (plugins[pluginName])
    logger.info('Plugin ' + pluginName + ' unloaded');

  delete plugins[pluginName];
}

module.exports = {
  getPlugin: function (name) {
    return plugins[name];
  },

  loadPlugin: loadPlugin
};