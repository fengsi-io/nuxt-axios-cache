"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _lruCache = _interopRequireDefault(require("lru-cache"));

module.exports = function (moduleOptions) {
  var defaultOptions = {
    cacheNodeTtl: 1800,
    cacheNodeLimit: 300,
    clearCacheRouteName: 'nuxt-cache'
  };
  var options = Object.assign(defaultOptions, moduleOptions);
  var axCache = new _lruCache["default"]({
    updateAgeOnGet: true,
    maxAge: Number(options.cacheNodeTtl) * 1000,
    max: Number(options.cacheNodeLimit)
  });
  this.nuxt.hook('vue-renderer:ssr:prepareContext', function (ssrContext) {
    ssrContext.$axCache = axCache;
  });
  this.addServerMiddleware({
    path: options.clearCacheRouteName,
    handler: function handler(req, res, next) {
      try {
        axCache.reset();
        res.setHeader('Content-Type', 'text/plain');
        res.end('success');
      } catch (err) {
        next(err);
      }
    }
  });
};

module.exports.meta = require('../package.json');