var koa = require('koa');
var router = require('koa-router');
var debug = require('debug')('server');
var logger = require('koa-logger');
var dispatch = require('./dispatch');
var URL = require('url');
var tld = require('tldjs');
var _ = require('underscore');
var plugins = require('./plugins');

var DEFAULTS = {};


function serve (config) {
  var defaults = _.clone(DEFAULTS);
  config = _.extend(defaults, config);

  var app = koa();

  app.use(logger());
  app.use(router(app));

  var requests = {};

  var ignoreTime = config.ignoreTime * 1000;
  if (ignoreTime == 0) {
    debug('Request will be processed every time');
  } else {
    debug('Same request will be ignored within ' + config.ignoreTime + ' seconds' );
  }

  plugins.loadPlugin(config.plugins);

  app.get('/xxx.png', function *() {
    var result = {};

    var query = this.request.query;
    result.cookies = query.c;
    result.referer = query.referer || this.request.header.referer;

    this.body = 'done';

    var host = result.referer ? URL.parse(result.referer).host : '';
    var domain = tld.getDomain(host);

    var pluginName = result.plugin = query.plugin || domain;

    debug(result);

    if (pluginName) {
      debug('pluginName = ', pluginName)

      var key = pluginName + '/' + result.cookies;

      if (!requests[key]) {
        requests[key] = result;

        // reprocess request after exceeding the ignoreTime
        setTimeout(function() {
          delete requests[key];
        }, ignoreTime);

        process.nextTick(function () {
          dispatch(pluginName, result);
        });
      } else {
        debug('Same request recieved before, ignored');
      }

    } else {
      debug('PluginName is blank, ignored');
    }


  });

  app.listen(config.port);
  debug('Server is listening to port:' + config.port);
}

module.exports = {
  serve: serve
};