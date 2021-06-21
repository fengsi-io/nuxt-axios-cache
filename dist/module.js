"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _lruCache = _interopRequireDefault(require("lru-cache"));

module.exports = function (moduleOptions) {
  var _moduleOptions$update = moduleOptions.updateAgeOnGet,
      updateAgeOnGet = _moduleOptions$update === void 0 ? true : _moduleOptions$update,
      _moduleOptions$cacheN = moduleOptions.cacheNodeTtl,
      cacheNodeTtl = _moduleOptions$cacheN === void 0 ? 1800 : _moduleOptions$cacheN,
      _moduleOptions$cacheN2 = moduleOptions.cacheNodeLimit,
      cacheNodeLimit = _moduleOptions$cacheN2 === void 0 ? 300 : _moduleOptions$cacheN2,
      _moduleOptions$clearC = moduleOptions.clearCacheRoutePath,
      clearCacheRoutePath = _moduleOptions$clearC === void 0 ? '/_/nuxt-cache' : _moduleOptions$clearC;
  var axCache = new _lruCache["default"]({
    updateAgeOnGet: updateAgeOnGet,
    maxAge: Number(cacheNodeTtl) * 1000,
    max: Number(cacheNodeLimit)
  });
  this.nuxt.hook('vue-renderer:ssr:prepareContext', function (ssrContext) {
    ssrContext.$axCache = axCache;
  });
  this.addServerMiddleware({
    path: clearCacheRoutePath,
    handler: function handler(req, res, next) {
      try {
        if (req.method === 'DELETE') {
          axCache.reset();
          res.setHeader('Content-Type', 'text/plain');
          res.end('success');
        } else {
          res.statusCode = 403;
          res.statusMessage = 'Not found';
          res.end();
        }
      } catch (err) {
        next(err);
      }
    }
  });
};

module.exports.meta = require('../package.json');