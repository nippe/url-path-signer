var should = require('should')
import test from 'ava';
const UrlSigner = require('../lib');

//
// test('foo', t => {
//   t.pass();
// });
//
// test('bar', async t => {
//   const bar = Promise.resolve('bar');
//
//   t.is(await bar, 'bar');
// });


test('Signing and verifying URLs should render a string', t => {
  t.ok(typeof UrlSigner().signature('http://hardcoded.se/index.html', 'my-secret').should.be.a.String());
});

test('should be a valid hash in legnth for default alog (sha1) and digest (hex)', (t) => {
  t.ok(UrlSigner().signature('http://hardcoded.se/index.html', 'my-secret')
    .should.be.a.String().with.lengthOf(40));
});

test('should verify with the same signagure', (t) => {
  t.pass(
    UrlSigner().verify('http://hardcoded.se/index.html', 'cd70492c0457a3a0bd05d97d3a262dae92538cde', 'my-secret')
  );
});

test('should return false if signature is wrong', (t) => {
  t.notOk(UrlSigner().verify('http://hardcoded.se/index.html', 'cd70222c0457a3a0bd05d97d3a262dae92538cde', 'my-secret'));
});

test('should generate different hashes for different keys', (t) => {
  var urlSigner = UrlSigner();
  var sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
  var sign2 = urlSigner.signature('http://hardcoded.se/index.html', 'my-other-secret');
  t.notSame(sign1, sign2);
});

test('should be same with and without query string', (t) => {
  var urlSigner = UrlSigner();
  var sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
  var sign2 = urlSigner.signature('http://hardcoded.se/index.html?foo=bar&hey=ya', 'my-secret');
  t.same(sign1, sign2);
});


test('should generate different hashes for different urls', (t) => {
  var urlSigner = UrlSigner();
  var sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
  var sign2 = urlSigner.signature('http://github.com/nippe', 'my-secret');
  t.notSame(sign1, sign2);
});


test('should be the same signgare with both http and https', (t) => {
  var urlSigner = UrlSigner();
  var httpSign = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
  var httpsSign = urlSigner.signature('https://hardcoded.se/index.html?foo=bar&hey=ya', 'my-secret');
  t.same(httpSign, httpsSign);
});

// describe('Building extrnal URLs', (t) => {
test('should build the url with a query string param containg the signed URL', (t) => {
  var wantedResult = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
  var originalUrl = 'https://assests.sourcedomain.com/images/image-1-2-3.jpg';

  t.same(
    UrlSigner()
    .buildProxyUrl({
        urlToSign: originalUrl,
        targetUrl: 'https://images.somedomain.com/proxyroute',
        appendType: 'querystring',
        qsUrlParameter: 'source',
        qsSignatureParameter: 'sign'
      },
      'my-secret'), wantedResult);
});

test('should build the url by appending the signed URL to the path', (t) => {
  var wantedResult = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg?sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
  var originalUrl = 'https://assests.sourcedomain.com/images/image-1-2-3.jpg';

  t.same(
    UrlSigner()
    .buildProxyUrl({
        urlToSign: originalUrl,
        targetUrl: 'https://images.somedomain.com/proxyroute',
        appendType: 'path',
        qsSignatureParameter: 'sign'
      },
      'my-secret'),
    wantedResult);
});

test('should blowup when "appendType" is not "querystring"', (t) => {
  t.throws(() => {
    UrlSigner()
      .buildProxyUrl({
          urlToSign: 'http://hardcoded.se/',
          targetUrl: 'https://images.somedomain.com/proxyroute',
          appendType: 'foobar',
          qsUrlParameter: 'source',
          qsSignatureParameter: 'sign'
        },
        'my-secret');
  });
});

test('should decnstruct and possitivly verify signature given a proxy url', (t) => {
  var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
  t.ok(UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret'));
});

test('should decnstruct and possitivly verify signature given a proxy url with an options literal', (t) => {
  var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
  var options = {
    appendType: 'querystring',
    qsUrlParameter: 'source',
    qsSignatureParameter: 'sign'
  };

  t.ok(UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options));
});

test('should decnstruct and possitivly verify signature given a proxy url with an options literal with other parmeter names', (t) => {
  var proxyUrl = 'https://images.somedomain.com/proxyroute?original=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
  var options = {
    appendType: 'querystring',
    qsUrlParameter: 'original',
    qsSignatureParameter: 's'
  };

  t.ok(UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options));
});
//
//   describe('Signed url as path', function() {
//
test('should accept signed url as path instead of querystring param', (t) => {
  var proxyUrl = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg?s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';

  var options = {
    appendType: 'path',
    proxyUrl: '/proxyroute',
    qsUrlParameter: '',
    qsSignatureParameter: 's'
  };
  t.ok(UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options));
});

test('should return false with signed url as path and wrong signature', (t) => {
  var proxyUrl = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg?s=98747241e6a226ba7e65e4d3d0dafc2f7dfd0000';

  var options = {
    appendType: 'path',
    proxyUrl: '/proxyroute',
    qsUrlParameter: '',
    qsSignatureParameter: 's'
  };
  t.notOk(UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options));
});

test('should return false with signed url does not exist', (t) => {
  var proxyUrl = 'https://images.somedomain.com/proxyroute/?s=98747241e6a226ba7e65e4d3d0dafc2f7dfd0000';

  var options = {
    appendType: 'path',
    proxyUrl: '/proxyroute',
    qsUrlParameter: '',
    qsSignatureParameter: 's'
  };
  t.notOk(UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options))
});

test('should accept signed url as path with querystring and validate true', (t) => {
  var proxyUrl = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg%3Fw%3D123%26h%3D543%26blur%3D12?s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';

  var options = {
    appendType: 'path',
    proxyUrl: '/proxyroute',
    qsUrlParameter: '',
    qsSignatureParameter: 's'
  };
  t.ok(UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options));
});

test('should validate false when changing the embedded domain name', (t) => {
  var proxyUrl = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests1.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg%3Fw%3D123%26h%3D543%26blur%3D12?s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';

  var options = {
    appendType: 'path',
    proxyUrl: '/proxyroute',
    qsUrlParameter: '',
    qsSignatureParameter: 's'
  };
  t.notOk(UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options));
});

//
// describe('Getting the signed URL from the proxy URL', function() {
test('should retrive the url correctly', (t) => {
  var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
  var signedUrl = 'https://assests.sourcedomain.com/images/image-1-2-3.jpg';
  t.same(UrlSigner().getSignedUrlFromProxyUrl(proxyUrl, 'my-secret'), signedUrl);
});

test('should blow up if signature does not match', (t) => {
  var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226111165e4d3d0dafc2f7dfdcf0a';
  var signedUrl = 'https://assests.sourcedomain.com/images/image-1-2-3.jpg';
  t.throws(() => {
    UrlSigner().getSignedUrlFromProxyUrl(proxyUrl, 'my-secret');
  });
});

// describe('Using different hashing algoritms', function() {
test('should not be the same result when signing with SHA1 and SHA256', (t) => {
  var sha1Sign = UrlSigner({
    algo: 'sha1'
  }).signature('http://hardcoded.se', 'my-secret');

  var sha256Sign = UrlSigner({
    algo: 'sha256'
  }).signature('http://hardcoded.se', 'my-secret');

  t.notSame(sha1Sign, sha256Sign);
});
