var assert = require('assert');
var should = require('should');
var UrlSigner = require('../lib');


describe('Signing and verifying URLs', function() {
  it('should render a signature', function(done){
    var sign = UrlSigner().sign('http://hardcoded.se/index.html', 'my-secret')
      .should.be.a.String();
    done();
  });
});



// var url = require('url');
// var crypto = require('crypto');
//
//
// module.exports = UrlSigner;
//
//
// function UrlSigner(options) {
//   'use strict'
//   var _options = {};
//
//   _options.algo = options.algo || 'sha1';
//   _options.digest = options.digest || 'hex';
//
//
//   this.
// }
