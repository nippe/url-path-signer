var UrlSigner = require('url-path-signer');

module.exports = function(options) {
  return new UrlSigner(options);
}
