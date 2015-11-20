var url = require('url');
var crypto = require('crypto');

var options;

module.exports = UrlSigner;


function UrlSigner(options) {
  'use strict'
  options = options || {};
  options.algo = options.algo || 'sha1';
  options.digest = options.digest || 'base64';

  this.sign = sign;
}


function sign(url, secret) {
  return 'foo';
}
