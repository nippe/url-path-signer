# Url Path Signer
[![Build Status](https://travis-ci.org/nippe/url-path-signer.svg)](https://travis-ci.org/nippe/url-path-signer)

Simple library for signing the host and path part of a URL, omitting the querystring and protocol in the signature.
```
http://www.hardcoded.se/some/funky/route?parameter=value&otherkey=othervalue
       ^-------------------------------^
               This part is signed
```

The reason for this is that when you set up a web proxy for images for example, you might want the client (web page, app, ...) to be able to send paramters to the servie that differs with screen size and other stuff. But you still don't want to put the signing logic out on the client, risking exposing the secret. So if the client adds `&width=180` or `&widht=240` to the querystring, it should not mess upp the signing.

## API
Get the signer:
```
var urlSigner = require('url-path-signer')();
```

### signature
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

### verify
Verifys a URL with a signature.

```
urlSigner.verity('http://hardcoded.se', '7a6832059b718801407afb9049bb8e1685c8f286' 'my-secret');
// => true

urlSigner.verity('http://hardcoded.se?key=value&otherkey=othervalue', '7a6832059b718801407afb9049bb8e1685c8f286' 'my-secret');
// => true

urlSigner.verity('http://otherurl.com', '7a6832059b718801407afb9049bb8e1685c8f286' 'my-secret');
// => false
```
