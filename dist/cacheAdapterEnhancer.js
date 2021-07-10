"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = cacheAdapterEnhancer;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _localforage = _interopRequireDefault(require("localforage"));

var _buildURL = _interopRequireDefault(require("axios/lib/helpers/buildURL"));

var forageCache = {
  get: function () {
    var _get = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(key) {
      var data, expire, value;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _localforage["default"].getItem(key);

            case 2:
              data = _context.sent;

              if (data) {
                _context.next = 5;
                break;
              }

              return _context.abrupt("return", null);

            case 5:
              expire = data.expire, value = data.value;

              if (!(expire < Date.now())) {
                _context.next = 9;
                break;
              }

              _localforage["default"].removeItem(key);

              return _context.abrupt("return", null);

            case 9:
              return _context.abrupt("return", value);

            case 10:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function get(_x) {
      return _get.apply(this, arguments);
    }

    return get;
  }(),
  set: function set(key, value) {
    var expire = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    if (expire && typeof expire === 'number') {
      expire = Math.round(expire * 1000 + Date.now()); // seconds

      localStorage.setItem('open_browser_date', expire);
    }

    return _localforage["default"].setItem(key, {
      value: value,
      expire: expire
    }, expire && callback);
  },
  del: function del(key) {
    _localforage["default"].removeItem(key);
  },
  clear: function clear() {
    _localforage["default"].clear();
  }
};

function buildSortedURL() {
  var builtURL = _buildURL["default"].apply(void 0, arguments);

  var _builtURL$split = builtURL.split('?'),
      _builtURL$split2 = (0, _slicedToArray2["default"])(_builtURL$split, 2),
      urlPath = _builtURL$split2[0],
      queryString = _builtURL$split2[1];

  if (queryString) {
    var paramsPair = queryString.split('&');
    return "".concat(urlPath, "?").concat(paramsPair.sort().join('&'));
  }

  return builtURL;
}

function cacheAdapterEnhancer(adapter) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$enabledByDef = options.enabledByDefault,
      enabledByDefault = _options$enabledByDef === void 0 ? true : _options$enabledByDef,
      _options$cacheFlag = options.cacheFlag,
      cacheFlag = _options$cacheFlag === void 0 ? 'cache' : _options$cacheFlag,
      _options$project = options.project,
      project = _options$project === void 0 ? 'default' : _options$project,
      _options$defaultCache = options.defaultCache,
      defaultCache = _options$defaultCache === void 0 ? null : _options$defaultCache,
      _options$cacheBrowser = options.cacheBrowserTtl,
      cacheBrowserTtl = _options$cacheBrowser === void 0 ? 3600 : _options$cacheBrowser,
      _options$cacheBrowser2 = options.cacheBrowserEnable,
      cacheBrowserEnable = _options$cacheBrowser2 === void 0 ? false : _options$cacheBrowser2; // 清除客户端缓存

  if (cacheBrowserEnable && window && window.localStorage) {
    if (localStorage.getItem('open_browser_date') && localStorage.getItem('open_browser_date') < Date.now()) {
      forageCache.clear();
    }

    var expire = Math.round(cacheBrowserTtl * 1000 + Date.now());
    localStorage.setItem('open_browser_date', expire);
  }

  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(config) {
      var _config$cacheFlag;

      var useCache, url, method, params, paramsSerializer, forceUpdate, _config$expireInSecon, expireInSeconds, key, responsePromise, item;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              useCache = (_config$cacheFlag = config[cacheFlag]) !== null && _config$cacheFlag !== void 0 ? _config$cacheFlag : enabledByDefault;
              url = config.url, method = config.method, params = config.params, paramsSerializer = config.paramsSerializer, forceUpdate = config.forceUpdate, _config$expireInSecon = config.expireInSeconds, expireInSeconds = _config$expireInSecon === void 0 ? cacheBrowserTtl : _config$expireInSecon;

              if (!(method === 'get' && useCache)) {
                _context2.next = 15;
                break;
              }

              key = project + ':' + buildSortedURL(url, params, paramsSerializer);
              responsePromise = null;

              if (!defaultCache) {
                _context2.next = 9;
                break;
              }

              responsePromise = defaultCache.get(key);

              if (!responsePromise || forceUpdate) {
                responsePromise = adapter(config).then(function (response) {
                  defaultCache.set(key, response);
                  return response;
                })["catch"](function (reason) {
                  defaultCache.del(key);
                  throw reason;
                });
              }

              return _context2.abrupt("return", responsePromise);

            case 9:
              if (!cacheBrowserEnable) {
                _context2.next = 15;
                break;
              }

              _context2.next = 12;
              return forageCache.get(key);

            case 12:
              item = _context2.sent;

              if (!item || forceUpdate) {
                responsePromise = adapter(config).then(function (response) {
                  var value = {
                    data: response.data,
                    status: response.status,
                    config: null,
                    request: null
                  };
                  forageCache.set(key, value, expireInSeconds, function (err) {
                    if (err) {
                      console.log(err);
                    }
                  });
                  return response;
                })["catch"](function (reason) {
                  forageCache.del(key);
                  throw reason;
                });
              } else {
                responsePromise = Promise.resolve(item);
              }

              return _context2.abrupt("return", responsePromise);

            case 15:
              return _context2.abrupt("return", adapter(config));

            case 16:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref.apply(this, arguments);
    };
  }();
}