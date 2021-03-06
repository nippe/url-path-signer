var should = require('should');
var UrlSigner = require('../lib');

describe('Signing and verifying URLs', function() {
  it('should render a string', function() {
    UrlSigner().signature('http://hardcoded.se/index.html', 'my-secret')
      .should.be.a.String();
  });

  it('should be a valid hash in legnth for default alog (sha1) and digest (hex)', function() {
    UrlSigner().signature('http://hardcoded.se/index.html', 'my-secret')
      .should.be.a.String().with.lengthOf(40);
  })

  it('should verify with the same signagure', function() {
    UrlSigner().verify('http://hardcoded.se/index.html', 'cd70492c0457a3a0bd05d97d3a262dae92538cde', 'my-secret')
      .should.be.true();
  });

  it('should return false if signature is wrong', function() {
    UrlSigner().verify('http://hardcoded.se/index.html', 'cd70222c0457a3a0bd05d97d3a262dae92538cde', 'my-secret')
      .should.be.false();
  });

  it('should generate different hashes for different keys', function() {
    var urlSigner = UrlSigner();
    var sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
    var sign2 = urlSigner.signature('http://hardcoded.se/index.html', 'my-other-secret');
    sign1.should.not.be.equal(sign2);
  });

  it('should be same with and without query string', function() {
    var urlSigner = UrlSigner();
    var sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
    var sign2 = urlSigner.signature('http://hardcoded.se/index.html?foo=bar&hey=ya', 'my-secret');

    sign1.should.be.equal(sign2);
  });


  it('should generate different hashes for different urls', function() {
    var urlSigner = UrlSigner();
    var sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
    var sign2 = urlSigner.signature('http://github.com/nippe', 'my-secret');

    sign1.should.not.be.equal(sign2);
  });


  it('should be the same signgare with both http and https', function() {
    var urlSigner = UrlSigner();
    var httpSign = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
    var httpsSign = urlSigner.signature('https://hardcoded.se/index.html?foo=bar&hey=ya', 'my-secret');

    httpSign.should.equal(httpsSign);
  });
});

describe('Building extrnal URLs', function() {
  it('should build the url with a query string param containg the signed URL', function() {
    var wantedResult = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
    var originalUrl = 'https://assests.sourcedomain.com/images/image-1-2-3.jpg';

    UrlSigner()
      .buildProxyUrl({
          urlToSign: originalUrl,
          targetUrl: 'https://images.somedomain.com/proxyroute',
          appendType: 'querystring',
          qsUrlParameter: 'source',
          qsSignatureParameter: 'sign'
        },
        'my-secret')
      .should.equal(wantedResult);
  });

  it('should build the url by appending the signed URL to the path', function() {
    var wantedResult = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg?sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
    var originalUrl = 'https://assests.sourcedomain.com/images/image-1-2-3.jpg';

    UrlSigner()
      .buildProxyUrl({
          urlToSign: originalUrl,
          targetUrl: 'https://images.somedomain.com/proxyroute',
          appendType: 'path',
          qsSignatureParameter: 'sign'
        },
        'my-secret')
      .should.equal(wantedResult);
  });

  it('should blowup when "appendType" is not "querystring"', function() {

    try {
      UrlSigner()
        .buildProxyUrl({
            urlToSign: 'http://hardcoded.se/',
            targetUrl: 'https://images.somedomain.com/proxyroute',
            appendType: 'foobar',
            qsUrlParameter: 'source',
            qsSignatureParameter: 'sign'
          },
          'my-secret');

      should.fail('Should never get here');
    } catch (error) {
      error.message.should.equal('Invalid appendType property');
    }
  });


  it('should decnstruct and possitivly verify signature given a proxy url', function() {
    var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
    UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret')
      .should.be.true();
  });


  it('should decnstruct and possitivly verify signature given a proxy url with an options literal', function() {
    var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
    var options = {
      appendType: 'querystring',
      qsUrlParameter: 'source',
      qsSignatureParameter: 'sign'
    };

    UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
      .should.be.true();
  });

  it('should decnstruct and possitivly verify signature given a proxy url with an options literal with other parmeter names', function() {
    var proxyUrl = 'https://images.somedomain.com/proxyroute?original=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
    var options = {
      appendType: 'querystring',
      qsUrlParameter: 'original',
      qsSignatureParameter: 's'
    };

    UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
      .should.be.true();
  });

  describe('Signed url as path', function() {

    it('should accept signed url as path instead of querystring param', function() {
      var proxyUrl = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg?s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';

      var options = {
        appendType: 'path',
        proxyUrl: '/proxyroute',
        qsUrlParameter: '',
        qsSignatureParameter: 's'
      };
      UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
        .should.be.true();
    });

    it('should return false with signed url as path and wrong signature', function() {
      var proxyUrl = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg?s=98747241e6a226ba7e65e4d3d0dafc2f7dfd0000';

      var options = {
        appendType: 'path',
        proxyUrl: '/proxyroute',
        qsUrlParameter: '',
        qsSignatureParameter: 's'
      };
      UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
        .should.be.false();
    });

    it('should return false with signed url does not exist', function() {
      var proxyUrl = 'https://images.somedomain.com/proxyroute/?s=98747241e6a226ba7e65e4d3d0dafc2f7dfd0000';

      var options = {
        appendType: 'path',
        proxyUrl: '/proxyroute',
        qsUrlParameter: '',
        qsSignatureParameter: 's'
      };
      UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
        .should.be.false();
    });


        it('should accept signed url as path with querystring and validate true', function() {
          var proxyUrl = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg%3Fw%3D123%26h%3D543%26blur%3D12?s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';

          var options = {
            appendType: 'path',
            proxyUrl: '/proxyroute',
            qsUrlParameter: '',
            qsSignatureParameter: 's'
          };
          UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
            .should.be.true();
        });

        it('should validate false when changing the embedded domain name', function() {
          var proxyUrl = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests1.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg%3Fw%3D123%26h%3D543%26blur%3D12?s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';

          var options = {
            appendType: 'path',
            proxyUrl: '/proxyroute',
            qsUrlParameter: '',
            qsSignatureParameter: 's'
          };
          UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
            .should.be.false();
        });

  });

});

describe('Getting the signed URL from the proxy URL', function() {
  it('should retrive the url correctly', function() {
    var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
    var signedUrl = 'https://assests.sourcedomain.com/images/image-1-2-3.jpg';
    UrlSigner().getSignedUrlFromProxyUrl(proxyUrl, 'my-secret')
      .should.equal(signedUrl);
  });

  it('should blow up if signature does not match', function() {
    var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226111165e4d3d0dafc2f7dfdcf0a';
    var signedUrl = 'https://assests.sourcedomain.com/images/image-1-2-3.jpg';
    try {
      UrlSigner().getSignedUrlFromProxyUrl(proxyUrl, 'my-secret');
      should.fail('Error was not thrown as it should have been');
    } catch (error) {
      error.message.should.equal('Signature does not match');
    }
  });
});


describe('Using different hashing algoritms', function() {
  it('should not be the same result when signing with SHA1 and SHA256', function() {
    var sha1Sign = UrlSigner({
      algo: 'sha1'
    }).signature('http://hardcoded.se', 'my-secret');

    var sha256Sign = UrlSigner({
      algo: 'sha256'
    }).signature('http://hardcoded.se', 'my-secret');

    sha1Sign.should.not.equal(sha256Sign);
  });


});
