var url = require('url');
var crypto = require('crypto');

var options = {};

module.exports = UrlSigner;


function UrlSigner(options) {
  'use strict'
  options = options || {};
  this.options = {
    algo: options.algo || 'sha1',
    digest: options.digest || 'hex'
  };
  this.signature = signature;
  this.verify = verify;
}


function signature(originalUrl, secret) {
  var urlObj = url.parse(originalUrl);
  var urlToSign = urlObj.host + urlObj.pathname;

  return crypto
    .createHmac(this.options.algo, secret)
    .update(urlToSign, 'utf-8')
    .digest(this.options.digest);
}

function verify(originalUrl, hash, secret) {
  return signature.call(this, originalUrl, secret) === hash;
}
