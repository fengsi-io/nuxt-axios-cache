# @fengsi/nuxt-axios-cache

## Setup

1. Add `@fengsi/nuxt-axios-cache` dependency to your project

```bash
yarn add @fengsi/nuxt-axios-cache # or npm install @fengsi/nuxt-axios-cache
```

2. Add `@fengsi/nuxt-axios-cache` to the `modules` section of `nuxt.config.js`

```js
export default {

  modules: [
    // Simple usage
    '@fengsi/nuxt-axios-cache',

    // With options
    ['@fengsi/nuxt-axios-cache', { 
      /* module options */
      cacheNodeTtl: 60 * 30,
      cacheNodeLimit: 300,
      clearCacheRoutePath: '/_/nuxt-cache' // Clear cache route, request method is DELETE
    }]
  ]
}
```

3. plugins/api.js
```js
import axios from 'axios'
import cacheAdapterEnhancer from '@fengsi/nuxt-axios-cache/dist/cacheAdapterEnhancer'

export default ({ ssrContext }) => {
  let adapter = null

  if (process.server) {
    adapter = cacheAdapterEnhancer(axios.defaults.adapter, {
      defaultCache: ssrContext.$axCache,
    })
  } else {
    adapter = cacheAdapterEnhancer(axios.defaults.adapter, {
      cacheBrowserEnable: true
    })
  }

  if (adapter && process.env.NODE_ENV !== 'development') {
    axios..create({ adapter })
  }
}
```

### default options
```js
  /* module options */
  updateAgeOnGet = true
  cacheNodeTtl = 1800
  cacheNodeLimit = 300
  clearCacheRoutePath = '/_/nuxt-cache' // 清除缓存路由， 请求方法为 DELETE

  /* cacheAdapterEnhancer options */
  enabledByDefault = true
  cacheFlag = 'cache'
  project = 'default' // key 值前缀
  defaultCache = null
  cacheBrowserEnable = false // 设置为 true 下面的参数才有作用
  cacheBrowserTtl = 3600
  cacheBrowserSession = true // 会话缓存
```

### Related configuration

<a href="https://github.com/isaacs/node-lru-cache" target="_blank">lru-cache</a> <br/>
<a href="https://github.com/localForage/localForage" target="_blank">localForage</a>