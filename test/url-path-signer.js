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

  it('should return false if signature is wrong', function(done){
    UrlSigner().verify('http://hardcoded.se/index.html', 'cd70222c0457a3a0bd05d97d3a262dae92538cde', 'my-secret')
      .should.be.false();
    done();
  });

  it('should generate different hashes for different keys', function(done) {
    var urlSigner = UrlSigner();
    var sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
    var sign2 = urlSigner.signature('http://hardcoded.se/index.html', 'my-other-secret');
    sign1.should.not.be.equal(sign2);
    done();
  });

  it('should be same with and without query string', function(done) {
    var urlSigner = UrlSigner();
    var sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
    var sign2 = urlSigner.signature('http://hardcoded.se/index.html?foo=bar&hey=ya', 'my-secret');

    sign1.should.be.equal(sign2);
    done();
  });


  it('should generate different hashes for different urls', function(done) {
    var urlSigner = UrlSigner();
    var sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
    var sign2 = urlSigner.signature('http://github.com/nippe', 'my-secret');

    sign1.should.not.be.equal(sign2);
    done();
  });


  it('should be the same signgare with both http and https', function(done){
    var urlSigner = UrlSigner();
    var httpSign = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
    var httpsSign = urlSigner.signature('https://hardcoded.se/index.html?foo=bar&hey=ya', 'my-secret');

    httpSign.should.equal(httpsSign);
    done();
  });
});

describe('Building extrnal URLs', function(done){
  it('should build the url with a query string param containg the signed URL', function(done){
    var wantedResult = 'https://imagecdn.acast.com/image?source=https%3A%2F%2Facastprod.blob.core.windows.net%3A443%2Fmedia%2Fv1%2Fd94d9795-bf58-4bbf-8102-e178b9ae60ab%2F-standoutpodcastgs-ih2h5unu.jpg&sign=b85ce72865bb0000eb12903d18d3dd8db52ad771';
    var originalUrl = 'https://acastprod.blob.core.windows.net:443/media/v1/d94d9795-bf58-4bbf-8102-e178b9ae60ab/-standoutpodcastgs-ih2h5unu.jpg';

    UrlSigner()
      .buildUrl({
        urlToSign: originalUrl,
        targetUrl: 'https://imagecdn.acast.com/image',
        appendType: 'querystring',
        qsUrlParameter: 'source',
        qsSignatureParameter: 'sign'
      },
      'my-secret')
      .should.equal(wantedResult);
    done();
  });

  it('should decnstruct and possitivly verify signature given a proxy url', function(done){
    var proxyUrl ='https://imagecdn.acast.com/image?source=https%3A%2F%2Facastprod.blob.core.windows.net%3A443%2Fmedia%2Fv1%2Fd94d9795-bf58-4bbf-8102-e178b9ae60ab%2F-standoutpodcastgs-ih2h5unu.jpg&sign=b85ce72865bb0000eb12903d18d3dd8db52ad771';
    UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret')
      .should.be.true();
    done();
  });


  it('should decnstruct and possitivly verify signature given a proxy url with an options literal', function(done){
    var proxyUrl ='https://imagecdn.acast.com/image?source=https%3A%2F%2Facastprod.blob.core.windows.net%3A443%2Fmedia%2Fv1%2Fd94d9795-bf58-4bbf-8102-e178b9ae60ab%2F-standoutpodcastgs-ih2h5unu.jpg&sign=b85ce72865bb0000eb12903d18d3dd8db52ad771';
    var options = {
      appendType: 'querystring',
      qsUrlParameter: 'source',
      qsSignatureParameter: 'sign'
    };

    UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
      .should.be.true();
    done();
  });

  it('should decnstruct and possitivly verify signature given a proxy url with an options literal with other parmeter names', function(done){
    var proxyUrl ='https://imagecdn.acast.com/image?original=https%3A%2F%2Facastprod.blob.core.windows.net%3A443%2Fmedia%2Fv1%2Fd94d9795-bf58-4bbf-8102-e178b9ae60ab%2F-standoutpodcastgs-ih2h5unu.jpg&s=b85ce72865bb0000eb12903d18d3dd8db52ad771';
    var options = {
      appendType: 'querystring',
      qsUrlParameter: 'original',
      qsSignatureParameter: 's'
    };

    UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
      .should.be.true();
    done();
  });
});

describe('Getting the signed URL from the proxy URL', function() {
  it('should retrive the url correctly', function(done) {
    var proxyUrl = 'https://imagecdn.acast.com/image?source=https%3A%2F%2Facastprod.blob.core.windows.net%3A443%2Fmedia%2Fv1%2Fd94d9795-bf58-4bbf-8102-e178b9ae60ab%2F-standoutpodcastgs-ih2h5unu.jpg&sign=b85ce72865bb0000eb12903d18d3dd8db52ad771';
    var signedUrl = 'https://acastprod.blob.core.windows.net:443/media/v1/d94d9795-bf58-4bbf-8102-e178b9ae60ab/-standoutpodcastgs-ih2h5unu.jpg';
    UrlSigner().getSignedUrlFromProxyUrl(proxyUrl, 'my-secret')
      .should.equal(signedUrl);
    done();
  });
});
