'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var reactRouterDom = require('react-router-dom');
var redis = _interopDefault(require('redis'));
var React = _interopDefault(require('react'));
var ReactDOMServer = _interopDefault(require('react-dom/server'));
var stream = require('stream');
var zlib = _interopDefault(require('zlib'));
var styledComponents = require('styled-components');

class MemoryCacheProvider {
  constructor(options) {
    this.cache = {};
    this.expired = options.expired * 1000;
  }

  async get(key) {
    const result = this.cache[key];

    if (result) {
      const now = new Date().getTime();

      if (result.created + result.expired > now) {
        return Promise.resolve(result.value);
      }
    }

    return Promise.resolve(null);
  }

  async set(key, value, expired) {
    const now = new Date().getTime();
    this.cache[key] = {
      value,
      created: now,
      expired: expired || this.expired
    };
    return Promise.resolve();
  }

}

const {
  promisify
} = require('util');

class RedisCacheProvider {
  constructor(options) {
    this.expired = options.expired;
    const client = redis.createClient(options.redis);
    this.client = client;
    this.getAsync = promisify(client.get).bind(client);
    this.setExAsync = promisify(client.setex).bind(client);
  }

  async get(key) {
    return this.getAsync(key);
  }

  async set(key, value, expired) {
    return this.setExAsync(key, expired || this.expired, value);
  }

}

class TokenProvider {
  constructor(options) {
    this.secureKey = options.secureKey || 'token';
  }

  updateContext(ctx, context) {
    /* eslint-disable-next-line */
    context.secureKey = ctx.cookies.get(this.secureKey);
  }

}

class SessionProvider {
  constructor(options) {
    this.secureKey = options.secureKey || 'koa:sess';
  }

  updateContext(ctx, context) {
    /* eslint-disable-next-line */
    context.secureKey = ctx.cookies.get(this.secureKey);
  }

}

class StringRender {
  constructor(options) {
    this.root = options.root;
    this.host = options.host;
    this.initializeStore = options.initializeStore;
    this.credential = options.credential;
  }

  async renderContent(ctx, next, plugins, firstPartOfHomePageContent, lastPartOfHomePageContent) {
    ctx.set('Content-Type', 'text/html');
    const context = {
      host: this.host,
      store: null
    };

    if (this.credential && typeof this.credential.updateContext === 'function') {
      this.credential.updateContext(ctx, context);
    }

    if (this.initializeStore && typeof this.initializeStore === 'function') {
      const store = await this.initializeStore(context);
      context.store = store;
    }

    const Root = this.root;
    let html = firstPartOfHomePageContent;
    let jsx;

    if (Array.isArray(plugins)) {
      jsx = plugins.reduce((element, plugin) => plugin(element), React.createElement(Root, {
        context: context
      }));
    } else {
      jsx = React.createElement(Root, {
        context: context
      });
    }

    const rootContent = ReactDOMServer.renderToString(jsx);
    let state;

    if (this.initializeStore) {
      state = context.store.getState();
      state.ssr = true;
    } else {
      state = {
        ssr: true
      };
    }

    const initialState = JSON.stringify(state).replace(/</g, '\\u003c');
    html += `${rootContent}</div><script>window.__INITIAL_STATE__ = ${initialState}</script>`;
    html += lastPartOfHomePageContent;
    ctx.body = html;
    return Promise.resolve(html);
  }

  renderCacheContent(ctx, next, content) {
    ctx.set('Content-Type', 'text/html');
    ctx.body = content;
  }

}

const encodingMethods = {
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate
};
class StringRender$1 {
  constructor(options) {
    this.compress = options.compress;
    this.threshold = options.threshold;
    this.root = options.root;
    this.host = options.host;
    this.initializeStore = options.initializeStore;
    this.credential = options.credential;
  }

  async renderContent(ctx, next, plugins, firstPartOfHomePageContent, lastPartOfHomePageContent) {
    const context = {
      host: this.host,
      store: null
    };

    if (this.credential && typeof this.credential.updateContext === 'function') {
      this.credential.updateContext(ctx, context);
    }

    if (this.initializeStore && typeof this.initializeStore === 'function') {
      const store = await this.initializeStore(context);
      context.store = store;
    }

    const Root = this.root;

    const renderToStream = readableStream => {
      const transformer = new stream.Transform({
        transform(chunk, encoding, callback) {
          this.push(firstPartOfHomePageContent + chunk);
          callback();
        }

      });
      readableStream.on('end', () => {
        let state;

        if (this.initializeStore) {
          state = context.store.getState();
          state.ssr = true;
        } else {
          state = {
            ssr: true
          };
        }

        const initialState = JSON.stringify(state).replace(/</g, '\\u003c');
        transformer.push(`</div><script>window.__INITIAL_STATE__=${initialState}</script>${lastPartOfHomePageContent}`);
        transformer.end();
      });
      readableStream.on('error', err => {
        // forward the error to the transform stream
        transformer.emit('error', err);
      });
      readableStream.pipe(transformer);
      return transformer;
    };

    await new Promise((resolve, reject) => {
      ctx.set('Content-Type', 'text/html');
      ctx.status = 200;
      let stream$$1;

      if (Array.isArray(plugins)) {
        stream$$1 = renderToStream(plugins.reduce((element, plugin) => plugin(ReactDOMServer.renderToNodeStream, element), React.createElement(Root, {
          context: context
        })));
      } else {
        stream$$1 = renderToStream(ReactDOMServer.renderToNodeStream(React.createElement(Root, {
          location: ctx.req.url,
          context: context
        })));
      } // don't work by koa-compress
      // ctx.body = stream;
      // #region custom compress


      if (this.compress) {
        const encoding = ctx.acceptsEncodings('gzip', 'deflate', 'identity');

        if (encoding !== 'identity') {
          ctx.set('Content-Encoding', encoding);
          const encodingStream = encodingMethods[encoding]({
            threshold: this.threshold
          });
          stream$$1.pipe(encodingStream).pipe(ctx.res);
        } else {
          stream$$1.pipe(ctx.res);
        }
      } else {
        stream$$1.pipe(ctx.res);
      } // #endregion


      let html = '';
      stream$$1.on('data', chunk => {
        html += chunk;
      }); // and finalize the response with closing HTML

      stream$$1.on('end', () => {
        resolve(html);
      });
    });
    await next();
  }

  renderCacheContent(ctx, next, content) {
    ctx.set('Content-Type', 'text/html');
    ctx.status = 200;
    const pass = new stream.PassThrough();
    ctx.body = pass;
    pass.write(content);
    pass.end();
  }

}

function stringStyledComponentsPlugin (element) {
  const sheet = new styledComponents.ServerStyleSheet();
  return sheet.collectStyles(element);
}

function streamStyledComponentsPlugin (renderToNodeStream, element) {
  const sheet = new styledComponents.ServerStyleSheet();
  return sheet.interleaveWithNodeStream(renderToNodeStream(element));
}

const DIV_END_TAG_LENGTH = '</div>'.length;
function index(config) {
  const {
    buildPath,
    template,
    rootElementId,
    route,
    cache,
    render,
    plugins
  } = config;
  const homeContent = fs.readFileSync(`${buildPath}/${template}`).toString();
  const rootElement = `<div id="${rootElementId}">`;
  const indexOfRootElement = homeContent.indexOf(rootElement);
  const firstPartOfHomePageContent = homeContent.substring(0, indexOfRootElement + rootElement.length);
  const lastPartOfHomePageContent = homeContent.substring(indexOfRootElement + rootElement.length + DIV_END_TAG_LENGTH);
  /* eslint-disable-next-line */

  const handler = async (ctx, next) => {
    const {
      url
    } = ctx.req;
    const currentRoute = route.routes.find(item => reactRouterDom.matchPath(url, item));

    if (!currentRoute) {
      return next();
    }

    try {
      if (cache && route.isCached(currentRoute)) {
        let content = await cache.get(url);

        if (content) {
          render.renderCacheContent(ctx, next, content);
        } else {
          content = await render.renderContent(ctx, next, plugins, firstPartOfHomePageContent, lastPartOfHomePageContent);
          await cache.set(url, content);
        }
      } else {
        await render.renderContent(ctx, next, plugins, firstPartOfHomePageContent, lastPartOfHomePageContent);
      }
    } catch (error) {
      throw error;
    }
  };

  return handler;
}

exports.default = index;
exports.StringRender = StringRender;
exports.StreamRender = StringRender$1;
exports.TokenProvider = TokenProvider;
exports.SessionProvider = SessionProvider;
exports.MemoryCacheProvider = MemoryCacheProvider;
exports.RedisCacheProvider = RedisCacheProvider;
exports.streamStyledComponentsPlugin = streamStyledComponentsPlugin;
exports.stringStyledComponentsPlugin = stringStyledComponentsPlugin;
