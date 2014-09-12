var page = require('webpage').create();

//var cookies = {"anonymid":"hyc90pnxh6ewzt","_r01_":"1","_de":"2B8EF3A0DF9D12FF670DBA321D8C6EB3BD2AB326CD16FC05","l4pager":"0","depovince":"GW","JSESSIONID":"abcqcQCEAbpbB5nxJ1AHu","XNESSESSIONID":"dcf70f500ab4","_urm_220959947":"269781","at":"1","jebe_key":"288d845e-c815-4c50-ae50-70bb87237ee1|664d37b7ba6432f0fa3a5ca4b3e27505|1410356176202|1|1410356198671","jebecookies":"792d4699-0b7b-4ce0-956c-72687bec350f|||||","p":"6854374718d2e8c484489c790174f9d77","ap":"220959947","t":"3c0580346439f08afb59c3c6d39f1d547","societyguester":"3c0580346439f08afb59c3c6d39f1d547","id":"220959947","xnsid":"9d80cbfe","ln_uact":"shaoshuai0102@gmail.com","ln_hurl":"http://hdn101.xnimg.cn/photos/hdn101/20081223/21/40/main_8oEP_71409c200150.jpg","loginfrom":"null","feedType":"220959947_hot"};
//console.log(phantom);

for( var key in cookies ) {
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



page.open('http://renren.com/' + cookies.id, function(status) {
  console.log('STATUS: ' + status);
  var obj = page.evaluate(function() {
    return {
      requestToken: XN.get_check,
      _rtk: XN.get_check_x
    }
  });
  console.log(JSON.stringify(obj));

  phantom.exit();
});