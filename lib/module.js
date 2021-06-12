import LRU from 'lru-cache'

module.exports = function (moduleOptions) {
  const defaultOptions = {
    cacheNodeTtl: 1800,
    cacheNodeLimit: 300,
    clearCacheRouteName: 'nuxt-cache'
  }

  const options = Object.assign(defaultOptions, moduleOptions)

  const axCache = new LRU({
    updateAgeOnGet: true,
    maxAge: Number(options.cacheNodeTtl) * 1000,
    max: Number(options.cacheNodeLimit)
  })

  this.nuxt.hook('vue-renderer:ssr:prepareContext', (ssrContext) => {
    ssrContext.$axCache = axCache
  })

  this.addServerMiddleware({
    path: options.clearCacheRouteName,
    handler (req, res, next) {
      try {
        axCache.reset()
        res.setHeader('Content-Type', 'text/plain')
        res.end('success')
      } catch (err) {
        next(err)
      }
    }
  })
}

module.exports.meta = require('../package.json')
