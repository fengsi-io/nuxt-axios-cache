import localForage from 'localforage'
import buildURL from 'axios/lib/helpers/buildURL'

const forageCache = {
  get: async (key) => {
    const data = await localForage.getItem(key)
    if (!data) { return null }

    const { expire, value } = data
    if (expire < Date.now()) {
      localForage.removeItem(key)
      return null
    }

    return value
  },

  set: (key, value, expire = false, callback = false) => {
    if (expire && typeof expire === 'number') {
      expire = Math.round(expire * 1000 + Date.now()) // seconds
      localStorage.setItem('open_browser_date', expire)
    }
    return localForage.setItem(key, { value, expire }, expire && callback)
  },

  del: (key) => {
    localForage.removeItem(key)
  },

  clear: () => {
    localForage.clear()
  }
}

function buildSortedURL (...args) {
  const builtURL = buildURL(...args)
  const [urlPath, queryString] = builtURL.split('?')
  if (queryString) {
    const paramsPair = queryString.split('&')
    return `${urlPath}?${paramsPair.sort().join('&')}`
  }
  return builtURL
}

export default function cacheAdapterEnhancer (adapter, options = {}) {
  const {
    enabledByDefault = true,
    cacheFlag = 'cache',
    project = 'default',
    defaultCache = null,
    cacheBrowserTtl = 3600,
    cacheBrowserEnable = false
  } = options

  // 清除客户端缓存
  if (cacheBrowserEnable && window && window.localStorage) {
    if (
      localStorage.getItem('open_browser_date') &&
      localStorage.getItem('open_browser_date') < Date.now()
    ) {
      forageCache.clear()
    }

    const expire = Math.round(cacheBrowserTtl * 1000 + Date.now())
    localStorage.setItem('open_browser_date', expire)
  }

  return async (config) => {
    const useCache = config[cacheFlag] ?? enabledByDefault
    const {
      url,
      method,
      params,
      paramsSerializer,
      forceUpdate,
      expireInSeconds = cacheBrowserTtl
    } = config

    if (method === 'get' && useCache) {
      const key = project + ':' + buildSortedURL(url, params, paramsSerializer)
      let responsePromise = null

      if (defaultCache) {
        responsePromise = defaultCache.get(key)

        if (!responsePromise || forceUpdate) {
          responsePromise = adapter(config)
            .then((response) => {
              defaultCache.set(key, response)
              return response
            })
            .catch((reason) => {
              defaultCache.del(key)
              throw reason
            })
        }

        return responsePromise
      }

      if (cacheBrowserEnable) {
        const item = await forageCache.get(key)

        if (!item || forceUpdate) {
          responsePromise = adapter(config)
            .then((response) => {
              const value = {
                data: response.data,
                status: response.status,
                config: null,
                request: null
              }
              forageCache.set(key, value, expireInSeconds, function (err) {
                if (err) {
                  console.log(err)
                }
              })
              return response
            })
            .catch((reason) => {
              forageCache.del(key)
              throw reason
            })
        } else {
          responsePromise = Promise.resolve(item)
        }

        return responsePromise
      }
    }

    return adapter(config)
  }
}
