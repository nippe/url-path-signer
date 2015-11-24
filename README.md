# Url Path Signer
[![Build Status](https://travis-ci.org/nippe/url-path-signer.svg)](https://travis-ci.org/nippe/url-path-signer)

Simple library for signing the host and path part of a URL, omitting the querystring and protocol in the signature.
```
http://www.hardcoded.se/some/funky/route?parameter=value&otherkey=othervalue
       ^-------------------------------^
               This part is signed
```

The reason for this is that when you set up a web proxy for images for example, you might want the client (web page, app, ...) to be able to send paramters to the servie that differs with screen size and other stuff. But you still don't want to put the signing logic out on the client, risking exposing the secret. So if the client adds `&width=180` or `&widht=240` to the querystring, it should not mess upp the signing.

## Installation

`npm install url-path-signer`

It takes a options object or nothing.
```
var urlSigner = require('url-path-signer')({
  algo: 'sha256',
  digest: 'hex'
});
```

Or empty

```
var urlSigner = require('url-path-signer')();
```

### Running tests
`npm test`

For development I use `gulp watch-mocha`


## API
Get the signer:
```
var urlSigner = require('url-path-signer')();
```

#### signature
Used to get the signature for a URL.
```
urlSigner.signature('http://hardcoded.se', 'my-secret');
// => 7a6832059b718801407afb9049bb8e1685c8f286

// With querystring
urlSigner.signature('http://hardcoded.se?key=value&otherkey=othervalue', 'my-secret');
// => 7a6832059b718801407afb9049bb8e1685c8f286  SAME!!

// https
urlSigner.signature('https://hardcoded.se', 'my-secret');
// => 7a6832059b718801407afb9049bb8e1685c8f286  SAME!!
```

#### verify
Verifys a URL with a signature.

```
urlSigner.verity('http://hardcoded.se', '7a6832059b718801407afb9049bb8e1685c8f286' 'my-secret');
// => true

urlSigner.verity('http://hardcoded.se?key=value&otherkey=othervalue', '7a6832059b718801407afb9049bb8e1685c8f286' 'my-secret');
// => true

urlSigner.verity('http://otherurl.com', '7a6832059b718801407afb9049bb8e1685c8f286' 'my-secret');
// => false
```

### Proxy routes
Now here is the reason I cobbled this together, so it might be a little bit to specific to my use case, or not.. Let me know.

So the thought is that I should be able use a web proxy for images and still keep stuff secure and only show images approved aka signed by me (by me I mean my system :)).

The first step is to build the URL. This is done by using buildUrl which takes a configuration object.

```
{
  urlToSign: 'http://static.image.somesite.com/image.jpg', // The image URL
  targetUrl: 'https://images.somedomain.com/proxyroute', // The URL to the proxy
  appendType: 'querystring',   // Append type
  qsUrlParameter: 'source',    // Name of the query string parameter
  qsSignatureParameter: 'sign' // Name of the signature parameter
}
```

|Property| Explanation | Default |
|-|-|-|
|urlToSign| The url to sign (to the source image for example) | N/A |
|targetUrl| The url of the proxy server | N/A |
|appendType| How to append it to the url, currently only query string supported| 'querystring' |
|qsUrlParameter| Name of the querystring key for the signed url | 'source'|
|qsSignatureParameter| Name of the querystring key for the signature | 'sign' |

So a call like this.

### buildProxyUrl

```
UrlSigner()
  .buildProxyUrl({
    urlToSign: 'https://assests.sourcedomain.com/images/image-1-2-3.jpg',
    targetUrl: 'https://webproxy.somedomain.com/proxyroute',
    appendType: 'querystring',
    qsUrlParameter: 'source',
    qsSignatureParameter: 'sign'
  },
  'my-secret');

// =>
https://webproxy.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a
```

### getSignedUrlFromProxyUrl
And the reverse works as well. However I'm not sure that this was the best design decision since I had some trouble getting the called URL raw from express, so I had to build it, which takes a way a bit of the point.

Anyways, when trying to get the url back `getSignedUrlFromProxyUrl` is your friend.

```
var proxyUrl = 'https://images.somedomain.com/proxyroute?source=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&sign=98747241e6a226111165e4d3d0dafc2f7dfdcf0a';
UrlSigner().getSignedUrlFromProxyUrl(proxyUrl, 'my-secret');
// => https://assests.sourcedomain.com/images/image-1-2-3.jpg (IF signature is valid)
```

It also takes the same options object as described [above](#proxy-routes).

### verifyProxyUrl
This is more of a utility method. Parses out the source url and verifies its signature. Returning true or false.

```
var proxyUrl ='https://images.somedomain.com/proxyroute?original=https%3A%2F%2Fassests.sourcedomain.com%2Fimages%2Fimage-1-2-3.jpg&s=98747241e6a226ba7e65e4d3d0dafc2f7dfdcf0a';
var options = {
  appendType: 'querystring',
  qsUrlParameter: 'original',
  qsSignatureParameter: 's'
};

UrlSigner().verifyProxyUrl(proxyUrl, 'my-secret', options)
// => true
```
