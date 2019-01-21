import React from 'react';
import ReactDOMServer from 'react-dom/server';

export default class StringRender {
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
    let html = firstPartOfHomePageContent;
    let jsx;
    if (Array.isArray(plugins)) {
      jsx = plugins.reduce((element, plugin) => plugin(element), <Root context={context} />);
    } else {
      jsx = <Root context={context} />;
    }

    const rootContent = ReactDOMServer.renderToString(jsx);
    let state;
    if (this.initializeStore) {
      state = context.store.getState();
      state.ssr = true;
    } else {
      state = { ssr: true };
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
