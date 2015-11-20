var assert = require('assert');
var should = require('should');
var UrlSigner = require('../lib');


describe('Signing and verifying URLs', function() {
  it('should render a string', function(done){
    UrlSigner().signature('http://hardcoded.se/index.html', 'my-secret')
      .should.be.a.String();
    done();
  });

  it('should be a valid hash in legnth for default alog (sha1) and digest (hex)', function(done) {
    UrlSigner().signature('http://hardcoded.se/index.html', 'my-secret')
      .should.be.a.String().with.lengthOf(40);
    done();
  })

  it('should verify with the same signagure', function(done){
    UrlSigner().verify('http://hardcoded.se/index.html', 'cd70492c0457a3a0bd05d97d3a262dae92538cde', 'my-secret')
      .should.be.true();
    done();
  });

  it('should be same with and without query string', function(done) {
    var urlSigner = UrlSigner();
    var sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
    var sign2 = urlSigner.signature('http://hardcoded.se/index.html?foo=bar&hey=ya', 'my-secret');

    sign1.should.be.equal(sign2);
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
