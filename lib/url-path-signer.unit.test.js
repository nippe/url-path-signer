const UrlSigner = require('./');

describe('Signing and verifying URLs', () => {
    it('should return string', () => {
        expect(
            UrlSigner().signature('http://hardcoded.se/index.html', 'my-secret')
        ).toBeDefined();
    });

    it('should be a valid hash in length for default alog (sha1) and digest (hex)', () => {
        expect(
            UrlSigner().signature('http://hardcoded.se/index.html', 'my-secret').length
        ).toBe(40)
    })

    it('should verify with the same signagure', () => {
        expect(
            UrlSigner().verify('http://hardcoded.se/index.html', 'cd70492c0457a3a0bd05d97d3a262dae92538cde', 'my-secret')
        ).toBeTruthy();
    });

    it('should return false if signature is wrong', () => {
        expect(
            UrlSigner().verify('http://hardcoded.se/index.html',
                'cd70222c0457a3a0bd05d97d3a262dae92538cde',
                'my-secret')
        ).toBeFalsy();
    });

    it('should generate different hashes for different keys', () => {
        const urlSigner = UrlSigner();
        const sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
        const sign2 = urlSigner.signature('http://hardcoded.se/index.html', 'my-other-secret');
        expect(sign1).not.toEqual(sign2);
    });

    it('should be same with and without query string', () => {
        const urlSigner = UrlSigner();
        const sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
        const sign2 = urlSigner.signature('http://hardcoded.se/index.html?foo=bar&hey=ya', 'my-secret');

        expect(sign1).toEqual(sign2);
    });


    it('should generate different hashes for different urls', () => {
        const urlSigner = UrlSigner();
        const sign1 = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
        const sign2 = urlSigner.signature('http://github.com/nippe', 'my-secret');
        expect(sign1).not.toEqual(sign2);
    });


    it('should be the same signgare with both http and https', () => {
        const urlSigner = UrlSigner();
        const httpSign = urlSigner.signature('http://hardcoded.se/index.html', 'my-secret');
        const httpsSign = urlSigner.signature('https://hardcoded.se/index.html?foo=bar&hey=ya', 'my-secret');
        expect(httpSign).toEqual(httpsSign);
    });

});


describe('Building extrnal URLs', () => {
    it('should build the url with a query string param containg the signed URL', () => {
        var wantedResult = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
        var originalUrl = 'https://assests.sourcedomain.com/images/image-1-2-3.jpg';
        expect(
            UrlSigner()
            .buildProxyUrl({
                    urlToSign: originalUrl,
                    targetUrl: 'https://images.somedomain.com/proxyroute',
                    appendType: 'querystring',
                    qsUrlParameter: 'source',
                    qsSignatureParameter: 'sign'
                },
                'my-secret')
        ).toBe(wantedResult);
    });

    it('should build the url by appending the signed URL to the path', () => {
        var wantedResult = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg?sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
        var originalUrl = 'https://assests.sourcedomain.com/images/image-1-2-3.jpg';
        expect(
            UrlSigner()
            .buildProxyUrl({
                    urlToSign: originalUrl,
                    targetUrl: 'https://images.somedomain.com/proxyroute',
                    appendType: 'path',
                    qsSignatureParameter: 'sign'
                },
                'my-secret')
        ).toBe(wantedResult);
    });

    it('should blowup when "appendType" is not "querystring"', () => {
        expect(() => {
            UrlSigner()
                .buildProxyUrl({
                        urlToSign: 'http://hardcoded.se/',
                        targetUrl: 'https://images.somedomain.com/proxyroute',
                        appendType: 'foobar',
                        qsUrlParameter: 'source',
                        qsSignatureParameter: 'sign'
                    },
                    'my-secret')
        }).toThrow();
    });


    it('should decnstruct and possitivly verify signature given a proxy url', () => {
        var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
        expect(
            UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret')
        ).toBeTruthy();
    });


    it('should decnstruct and possitivly verify signature given a proxy url with an options literal', () => {
        var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
        var options = {
            appendType: 'querystring',
            qsUrlParameter: 'source',
            qsSignatureParameter: 'sign'
        };

        expect(
            UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
        ).toBeTruthy();
    });

    it('should decnstruct and possitivly verify signature given a proxy url with an options literal with other parmeter names', () => {
        var proxyUrl = 'https://images.somedomain.com/proxyroute?original=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
        var options = {
            appendType: 'querystring',
            qsUrlParameter: 'original',
            qsSignatureParameter: 's'
        };

        expect(
            UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
        ).toBeTruthy();
    });

    describe('Signed url as path', () => {

        it('should accept signed url as path instead of querystring param', () => {
            var proxyUrl = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg?s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';

            var options = {
                appendType: 'path',
                proxyUrl: '/proxyroute',
                qsUrlParameter: '',
                qsSignatureParameter: 's'
            };

            expect(
              UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
            ).toBeTruthy();
        });

        it('should return false with signed url as path and wrong signature', () => {
            var proxyUrl = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg?s=98747241e6a226ba7e65e4d3d0dafc2f7dfd0000';

            var options = {
                appendType: 'path',
                proxyUrl: '/proxyroute',
                qsUrlParameter: '',
                qsSignatureParameter: 's'
            };

            expect(
            UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
          ).toBeFalsy();
        });

        it('should return false with signed url does not exist', () => {
            var proxyUrl = 'https://images.somedomain.com/proxyroute/?s=98747241e6a226ba7e65e4d3d0dafc2f7dfd0000';

            var options = {
                appendType: 'path',
                proxyUrl: '/proxyroute',
                qsUrlParameter: '',
                qsSignatureParameter: 's'
            };
            expect( UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options) )
              .toBeFalsy();
        });


        it('should accept signed url as path with querystring and validate true', () => {
            var proxyUrl = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg%3Fw%3D123%26h%3D543%26blur%3D12?s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';

            var options = {
                appendType: 'path',
                proxyUrl: '/proxyroute',
                qsUrlParameter: '',
                qsSignatureParameter: 's'
            };
            expect( UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options))
              .toBeTruthy();
        });

        it('should validate false when changing the embedded domain name', () => {
            var proxyUrl = 'https://images.somedomain.com/proxyroute/https%3A%2F%2Fassests1.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg%3Fw%3D123%26h%3D543%26blur%3D12?s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';

            var options = {
                appendType: 'path',
                proxyUrl: '/proxyroute',
                qsUrlParameter: '',
                qsSignatureParameter: 's'
            };

            expect(UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options))
              .toBeFalsy();
        });

    });

});


describe('Getting the signed URL from the proxy URL', () => {
  it('should retrive the url correctly', () => {
    var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
    var signedUrl = 'https://assests.sourcedomain.com/images/image-1-2-3.jpg';
    expect(UrlSigner().getSignedUrlFromProxyUrl(proxyUrl, 'my-secret'))
      .toBe(signedUrl);
  });

  it('should blow up if signature does not match', () => {
    var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226111165e4d3d0dafc2f7dfdcf0a';
    var signedUrl = 'https://assests.sourcedomain.com/images/image-1-2-3.jpg';
    expect(() => {
      UrlSigner().getSignedUrlFromProxyUrl(proxyUrl, 'my-secret');
      should.fail('Error was not thrown as it should have been');
    }).toThrow();
  });
});


describe('Using different hashing algoritms', () => {
  it('should not be the same result when signing with SHA1 and SHA256', () => {
    var sha1Sign = UrlSigner({
      algo: 'sha1'
    }).signature('http://hardcoded.se', 'my-secret');

    var sha256Sign = UrlSigner({
      algo: 'sha256'
    }).signature('http://hardcoded.se', 'my-secret');

    expect(sha1Sign).not.toBe(sha256Sign);
  });

});
