var debug = require('debug')('renren.com');
var cookie = require('cookie');
var request = require('request');
var phridge = require('phridge');


request.debug = false;

function run(data) {
  var cookies = cookie.parse(data.cookies);

  phridge
      .spawn()
      .then(function (phantom) {

        phantom.run(cookies, function (cookies, resolve) {
          //var page = require('webpage').create();
          var page = webpage.create();

          for (var key in cookies) {
            phantom.addCookie({
              name: key,
              value: cookies[key],
              path: '/',
              domain: '.renren.com',
              httponly: false,
              secure: false,
              expires: 'Infinity'
            });
          }

          page.open('http://renren.com/' + cookies.id, function (status) {
            console.log('STATUS: ' + status);
            var obj = page.evaluate(function () {
              return {
                requestToken: XN.get_check,
                _rtk: XN.get_check_x
              }
            });
            resolve(obj);

            //phantom.exit();
          });
        })
        .then(function (obj) {
          debug('obj: ', obj);
          phantom.dispose();

          request({
            method: 'POST',
            timeout: 100000,
            url: 'http://shell.renren.com/' + cookies.id + '/status',
            headers: {
              Cookie: data.cookies
            },
            form: {
              content: 'test ' + (new Date).getTime(),
              withInfo: '{"wpath":[]}',
              hostid: cookies.id,
              privacyParams: '{"sourceControl": 99}',
              requestToken: obj.requestToken,
              _rtk: obj._rtk,
              channel: 'renren'
            }
          }, function(err, res, body) {
            debug('err', err);
            debug('body', body);
          });
        });
      })
      .catch(function (err) {
        console.log(err); // 'An unknown error occured'
      });

}

exports.run = run;