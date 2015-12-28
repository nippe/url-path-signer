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
  this.buildUrl = buildProxyUrl;
  this.buildProxyUrl = buildProxyUrl; // Sorry, did a late rename and to not break api...
  this.verifyProxyUrl = verifyProxyUrl;
  this.getSignedUrlFromProxyUrl = getSignedUrlFromProxyUrl;
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


function buildProxyUrl(buildInfo, secret) {
  if(buildInfo.appendType === 'querystring') {
    return buildInfo.targetUrl
      + '?'
      + buildInfo.qsUrlParameter
      + '='
      + encodeURIComponent(buildInfo.urlToSign)
      + '&'
      + buildInfo.qsSignatureParameter
      + '='
      + signature.call(this, buildInfo.urlToSign, secret)
  } else if (buildInfo.appendType === 'path') {
    return buildInfo.targetUrl
      + '/'
      + encodeURIComponent(buildInfo.urlToSign)
      + '?'
      + buildInfo.qsSignatureParameter
      + '='
      + signature.call(this, buildInfo.urlToSign, secret)
  } else {
    throw new Error('Invalid appendType property');
  }
}

function verifyProxyUrl(proxyUrl, secret, options) {
  var options = options || {};
  options.qsSignatureParameter = options.qsSignatureParameter || 'sign';
  options.qsUrlParameter = options.qsUrlParameter || 'source';
  var urlToParse = url.parse(proxyUrl, true);


  //TODO: Whatif its in the path... route matching
  if(options.appendType === 'path') {
    var s = urlToParse.query[options.qsSignatureParameter];
    var pathPrts = urlToParse.pathname.replace(options.proxyUrl, '').split('/');
    var signedUrl;
    for(var i = 0; i < pathPrts.length; i++) {
      if(pathPrts[i]) {
        return verify.call(this,
          decodeURIComponent(pathPrts[i]),
          s,
          secret);
      }
    }
    return false;
  } else {
    var urlQuery = urlToParse.query;
    return verify.call(this,
      urlQuery[options.qsUrlParameter],
      urlQuery[options.qsSignatureParameter],
      secret);
  }
}

function getSignedUrlFromProxyUrl(proxyUrl, secret, options) {
  var options = options || {};
  options.qsSignatureParameter = options.qsSignatureParameter || 'sign';
  options.qsUrlParameter = options.qsUrlParameter || 'source';

  if(!verifyProxyUrl.call(this, proxyUrl, secret, options)) {
    throw new Error('Signature does not match');
  }

  return url.parse(proxyUrl, true).query[options.qsUrlParameter];
}
