import LRU from 'lru-cache'

module.exports = function (moduleOptions) {
  const {
    updateAgeOnGet = true,
    cacheNodeTtl = 1800,
    cacheNodeLimit = 300,
    clearCacheRouteName = 'nuxt-cache'
  } = moduleOptions

  const axCache = new LRU({
    updateAgeOnGet,
    maxAge: Number(cacheNodeTtl) * 1000,
    max: Number(cacheNodeLimit)
  })

  this.nuxt.hook('vue-renderer:ssr:prepareContext', (ssrContext) => {
    ssrContext.$axCache = axCache
  })

  this.addServerMiddleware({
    path: clearCacheRouteName,
    handler (req, res, next) {
      try {
        if (req.method === 'DELETE') {
          axCache.reset()
          res.setHeader('Content-Type', 'text/plain')
          res.end('success')
        } else {
          res.statusCode = 403
          res.statusMessage = 'Not found'
          res.end()
        }
      } catch (err) {
        next(err)
      }
    }
  })
}

module.exports.meta = require('../package.json')
