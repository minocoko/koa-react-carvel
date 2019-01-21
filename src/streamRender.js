import { PassThrough, Transform } from 'stream';
import zlib from 'zlib';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const encodingMethods = {
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate,
};

export default class StringRender {
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
      store: null,
    };
    if (this.credential && typeof this.credential.updateContext === 'function') {
      this.credential.updateContext(ctx, context);
    }
    if (this.initializeStore && typeof this.initializeStore === 'function') {
      const store = await this.initializeStore(context);
      context.store = store;
    }
    const Root = this.root;
    const renderToStream = (readableStream) => {
      const transformer = new Transform({
        transform(chunk, encoding, callback) {
          this.push(firstPartOfHomePageContent + chunk);
          callback();
        },
      });

      readableStream.on('end', () => {
        let state;
        if (this.initializeStore) {
          state = context.store.getState();
          state.ssr = true;
        } else {
          state = { ssr: true };
        }
        const initialState = JSON.stringify(state).replace(/</g, '\\u003c');
        transformer.push(`</div><script>window.__INITIAL_STATE__=${initialState}</script>${lastPartOfHomePageContent}`);
        transformer.end();
      });
      readableStream.on('error', (err) => {
        // forward the error to the transform stream
        transformer.emit('error', err);
      });

      readableStream.pipe(transformer);
      return transformer;
    };

    await new Promise((resolve, reject) => {
      ctx.set('Content-Type', 'text/html');
      ctx.status = 200;
      let stream;
      if (Array.isArray(plugins)) {
        stream = renderToStream(plugins
          .reduce(
            (element, plugin) => plugin(ReactDOMServer.renderToNodeStream, element),
                        <Root context={context} />,
          ));
      } else {
        stream = renderToStream(ReactDOMServer
          .renderToNodeStream(<Root location={ctx.req.url} context={context} />));
      }

      // don't work by koa-compress
      // ctx.body = stream;
      // #region custom compress
      if (this.compress) {
        const encoding = ctx.acceptsEncodings('gzip', 'deflate', 'identity');
        if (encoding !== 'identity') {
          ctx.set('Content-Encoding', encoding);
          const encodingStream = encodingMethods[encoding]({ threshold: this.threshold });
          stream.pipe(encodingStream).pipe(ctx.res);
        } else {
          stream.pipe(ctx.res);
        }
      } else {
        stream.pipe(ctx.res);
      }
      // #endregion

      let html = '';
      stream.on('data', (chunk) => { html += chunk; });
      // and finalize the response with closing HTML
      stream.on('end', () => {
        resolve(html);
      });
    });
    await next();
  }

  renderCacheContent(ctx, next, content) {
    ctx.set('Content-Type', 'text/html');
    ctx.status = 200;
    const pass = new PassThrough();
    ctx.body = pass;
    pass.write(content);
    pass.end();
  }
}
