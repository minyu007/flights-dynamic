const superagent = require('superagent');
require('superagent-proxy')(superagent);
const proxy = process.env.http_proxy;
const wait = 180000;
const browserMsg = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
  'Content-Type': 'application/x-www-form-urlencoded',
};
const service = {
  sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  },
  getData(url) {
    console.log(url);
    return new Promise(function (resolve, reject) {
      let i = '';
      i = url.indexOf('?') == -1 ? '?' : '&';
      url = url + i + 'timestamp=' + new Date().getTime();
      // .proxy(proxy)
      superagent
        .get(url)
        .set(browserMsg)
        .end(function (err, res) {
          resolve(res);
        });
    });
  },
  postData(url, payload) {
    return new Promise(function (resolve, reject) {
      let i = '';
      i = url.indexOf('?') == -1 ? '?' : '&';
      url = url + i + 'timestamp=' + new Date().getTime();
      // .proxy(proxy)
      superagent
        .post(url)
        .send(payload)
        .set(browserMsg)
        .end(function (err, res) {
          resolve(res);
        });
    });
  },
};

module.exports = service;
