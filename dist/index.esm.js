import fs from 'fs';
import { matchPath } from 'react-router-dom';
import redis from 'redis';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { PassThrough, Transform } from 'stream';
import zlib from 'zlib';
import { ServerStyleSheet } from 'styled-components';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var MemoryCacheProvider =
/*#__PURE__*/
function () {
  function MemoryCacheProvider(options) {
    _classCallCheck(this, MemoryCacheProvider);

    this.cache = {};
    this.expired = options.expired * 1000;
  }

  _createClass(MemoryCacheProvider, [{
    key: "get",
    value: function () {
      var _get$$1 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(key) {
        var result, now;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                result = this.cache[key];

                if (!result) {
                  _context.next = 5;
                  break;
                }

                now = new Date().getTime();

                if (!(result.created + result.expired > now)) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return", Promise.resolve(result.value));

              case 5:
                return _context.abrupt("return", Promise.resolve(null));

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function get(_x) {
        return _get$$1.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: "set",
    value: function () {
      var _set$$1 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(key, value, expired) {
        var now;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                now = new Date().getTime();
                this.cache[key] = {
                  value: value,
                  created: now,
                  expired: expired || this.expired
                };
                return _context2.abrupt("return", Promise.resolve());

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function set(_x2, _x3, _x4) {
        return _set$$1.apply(this, arguments);
      }

      return set;
    }()
  }]);

  return MemoryCacheProvider;
}();

var _require = require('util'),
    promisify = _require.promisify;

var RedisCacheProvider =
/*#__PURE__*/
function () {
  function RedisCacheProvider(options) {
    _classCallCheck(this, RedisCacheProvider);

    this.expired = options.expired;
    var client = redis.createClient(options.redis);
    this.client = client;
    this.getAsync = promisify(client.get).bind(client);
    this.setExAsync = promisify(client.setex).bind(client);
  }

  _createClass(RedisCacheProvider, [{
    key: "get",
    value: function () {
      var _get$$1 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(key) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", this.getAsync(key));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function get(_x) {
        return _get$$1.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: "set",
    value: function () {
      var _set$$1 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(key, value, expired) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", this.setExAsync(key, expired || this.expired, value));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function set(_x2, _x3, _x4) {
        return _set$$1.apply(this, arguments);
      }

      return set;
    }()
  }]);

  return RedisCacheProvider;
}();

var TokenProvider =
/*#__PURE__*/
function () {
  function TokenProvider(options) {
    _classCallCheck(this, TokenProvider);

    this.secureKey = options.secureKey || 'token';
  }

  _createClass(TokenProvider, [{
    key: "updateContext",
    value: function updateContext(ctx, context) {
      context.secureKey = ctx.cookies.get(this.secureKey);
    }
  }]);

  return TokenProvider;
}();

var SessionProvider =
/*#__PURE__*/
function () {
  function SessionProvider(options) {
    _classCallCheck(this, SessionProvider);

    this.secureKey = options.secureKey || 'koa:sess';
  }

  _createClass(SessionProvider, [{
    key: "updateContext",
    value: function updateContext(ctx, context) {
      context.secureKey = ctx.cookies.get(this.secureKey);
    }
  }]);

  return SessionProvider;
}();

var StringRender =
/*#__PURE__*/
function () {
  function StringRender(options) {
    _classCallCheck(this, StringRender);

    this.root = options.root;
    this.host = options.host;
    this.initializeStore = options.initializeStore;
    this.credential = options.credential;
  }

  _createClass(StringRender, [{
    key: "renderContent",
    value: function () {
      var _renderContent = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(ctx, next, plugins, firstPartOfHomePageContent, lastPartOfHomePageContent) {
        var context, store, Root, html, jsx, rootContent, state, initialState;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                ctx.set('Content-Type', 'text/html');
                context = {
                  host: this.host,
                  store: null
                };

                if (this.credential && typeof this.credential.updateContext === 'function') {
                  this.credential.updateContext(ctx, context);
                }

                if (!(this.initializeStore && typeof this.initializeStore === 'function')) {
                  _context.next = 8;
                  break;
                }

                _context.next = 6;
                return this.initializeStore(context);

              case 6:
                store = _context.sent;
                context.store = store;

              case 8:
                Root = this.root;
                html = firstPartOfHomePageContent;

                if (Array.isArray(plugins)) {
                  jsx = plugins.reduce(function (element, plugin) {
                    return plugin(element);
                  }, React.createElement(Root, {
                    context: context
                  }));
                } else {
                  jsx = React.createElement(Root, {
                    context: context
                  });
                }

                rootContent = ReactDOMServer.renderToString(jsx);

                if (this.initializeStore) {
                  state = context.store.getState();
                  state.ssr = true;
                } else {
                  state = {
                    ssr: true
                  };
                }

                initialState = JSON.stringify(state).replace(/</g, "\\u003c");
                html += "".concat(rootContent, "</div><script>window.__INITIAL_STATE__ = ").concat(initialState, "</script>");
                html += lastPartOfHomePageContent;
                ctx.body = html;
                return _context.abrupt("return", Promise.resolve(html));

              case 18:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function renderContent(_x, _x2, _x3, _x4, _x5) {
        return _renderContent.apply(this, arguments);
      }

      return renderContent;
    }()
  }, {
    key: "renderCacheContent",
    value: function renderCacheContent(ctx, next, content) {
      ctx.set('Content-Type', 'text/html');
      ctx.body = content;
    }
  }]);

  return StringRender;
}();

var encodingMethods = {
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate
};

var StringRender$1 =
/*#__PURE__*/
function () {
  function StringRender(options) {
    _classCallCheck(this, StringRender);

    this.compress = options.compress;
    this.threshold = options.threshold;
    this.root = options.root;
    this.host = options.host;
    this.initializeStore = options.initializeStore;
    this.credential = options.credential;
  }

  _createClass(StringRender, [{
    key: "renderContent",
    value: function () {
      var _renderContent = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(ctx, next, plugins, firstPartOfHomePageContent, lastPartOfHomePageContent) {
        var _this = this;

        var context, store, Root, renderToStream;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                context = {
                  host: this.host,
                  store: null
                };

                if (this.credential && typeof this.credential.updateContext === 'function') {
                  this.credential.updateContext(ctx, context);
                }

                if (!(this.initializeStore && typeof this.initializeStore === 'function')) {
                  _context.next = 7;
                  break;
                }

                _context.next = 5;
                return this.initializeStore(context);

              case 5:
                store = _context.sent;
                context.store = store;

              case 7:
                Root = this.root;

                renderToStream = function renderToStream(readableStream) {
                  var transformer = new Transform({
                    transform: function transform(chunk, encoding, callback) {
                      this.push(firstPartOfHomePageContent + chunk);
                      callback();
                    }
                  });
                  readableStream.on('end', function () {
                    var state;

                    if (_this.initializeStore) {
                      state = context.store.getState();
                      state.ssr = true;
                    } else {
                      state = {
                        ssr: true
                      };
                    }

                    var initialState = JSON.stringify(state).replace(/</g, "\\u003c");
                    transformer.push("</div><script>window.__INITIAL_STATE__=".concat(initialState, "</script>").concat(lastPartOfHomePageContent));
                    transformer.end();
                  });
                  readableStream.on('error', function (err) {
                    // forward the error to the transform stream
                    transformer.emit('error', err);
                  });
                  readableStream.pipe(transformer);
                  return transformer;
                };

                _context.next = 11;
                return new Promise(function (resolve, reject) {
                  ctx.set('Content-Type', 'text/html');
                  ctx.status = 200;
                  var stream;

                  if (Array.isArray(plugins)) {
                    stream = renderToStream(plugins.reduce(function (element, plugin) {
                      return plugin(ReactDOMServer.renderToNodeStream, element);
                    }, React.createElement(Root, {
                      context: context
                    })));
                  } else {
                    stream = renderToStream(ReactDOMServer.renderToNodeStream(React.createElement(Root, {
                      location: ctx.req.url,
                      context: context
                    })));
                  } // don't work by koa-compress
                  // ctx.body = stream;
                  // #region custom compress


                  if (_this.compress) {
                    var encoding = ctx.acceptsEncodings('gzip', 'deflate', 'identity');

                    if (encoding !== 'identity') {
                      ctx.set('Content-Encoding', encoding);
                      var encodingStream = encodingMethods[encoding]({
                        threshold: _this.threshold
                      });
                      stream.pipe(encodingStream).pipe(ctx.res);
                    } else {
                      stream.pipe(ctx.res);
                    }
                  } else {
                    stream.pipe(ctx.res);
                  } // #endregion


                  var html = '';
                  stream.on('data', function (chunk) {
                    html += chunk;
                  }); // and finalize the response with closing HTML

                  stream.on('end', function () {
                    resolve(html);
                  });
                });

              case 11:
                _context.next = 13;
                return next();

              case 13:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function renderContent(_x, _x2, _x3, _x4, _x5) {
        return _renderContent.apply(this, arguments);
      }

      return renderContent;
    }()
  }, {
    key: "renderCacheContent",
    value: function renderCacheContent(ctx, next, content) {
      ctx.set('Content-Type', 'text/html');
      ctx.status = 200;
      var pass = new PassThrough();
      ctx.body = pass;
      pass.write(content);
      pass.end();
    }
  }]);

  return StringRender;
}();

function stringStyledComponentsPlugin (element) {
  var sheet = new ServerStyleSheet();
  return sheet.collectStyles(element);
}

function streamStyledComponentsPlugin (renderToNodeStream, element) {
  var sheet = new ServerStyleSheet();
  return sheet.interleaveWithNodeStream(renderToNodeStream(element));
}

var DIV_END_TAG_LENGTH = '</div>'.length;
var index = (function (config) {
  var buildPath = config.buildPath,
      template = config.template,
      rootElementId = config.rootElementId,
      route = config.route,
      cache = config.cache,
      render = config.render,
      plugins = config.plugins;
  var homeContent = fs.readFileSync("".concat(buildPath, "/").concat(template)).toString();
  var rootElement = "<div id=\"".concat(rootElementId, "\">");
  var indexOfRootElement = homeContent.indexOf(rootElement);
  var firstPartOfHomePageContent = homeContent.substring(0, indexOfRootElement + rootElement.length);
  var lastPartOfHomePageContent = homeContent.substring(indexOfRootElement + rootElement.length + DIV_END_TAG_LENGTH);
  /* eslint-disable-next-line */

  var handler =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(ctx, next) {
      var url, currentRoute, content;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              url = ctx.req.url;
              currentRoute = route.routes.find(function (item) {
                return matchPath(url, item);
              });

              if (currentRoute) {
                _context.next = 4;
                break;
              }

              return _context.abrupt("return", next());

            case 4:
              _context.prev = 4;

              if (!(cache && route.isCached(currentRoute))) {
                _context.next = 20;
                break;
              }

              _context.next = 8;
              return cache.get(url);

            case 8:
              content = _context.sent;

              if (!content) {
                _context.next = 13;
                break;
              }

              render.renderCacheContent(ctx, next, content);
              _context.next = 18;
              break;

            case 13:
              _context.next = 15;
              return render.renderContent(ctx, next, plugins, firstPartOfHomePageContent, lastPartOfHomePageContent);

            case 15:
              content = _context.sent;
              _context.next = 18;
              return cache.set(url, content);

            case 18:
              _context.next = 22;
              break;

            case 20:
              _context.next = 22;
              return render.renderContent(ctx, next, plugins, firstPartOfHomePageContent, lastPartOfHomePageContent);

            case 22:
              _context.next = 27;
              break;

            case 24:
              _context.prev = 24;
              _context.t0 = _context["catch"](4);
              throw _context.t0;

            case 27:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[4, 24]]);
    }));

    return function handler(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  return handler;
});

export default index;
export { StringRender, StringRender$1 as StreamRender, TokenProvider, SessionProvider, MemoryCacheProvider, RedisCacheProvider, streamStyledComponentsPlugin, stringStyledComponentsPlugin };
