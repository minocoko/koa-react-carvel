'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var reactRouterDom = require('react-router-dom');
require('redis');
require('react');
require('react-dom/server');
require('stream');
var zlib = _interopDefault(require('zlib'));
require('styled-components');

const {
  promisify
} = require('util');

const encodingMethods = {
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate
};

const DIV_END_TAG_LENGTH = '</div>'.length;
var index = (config => {
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
}); // export {
//   StringRender,
//   StreamRender,
//   TokenProvider,
//   SessionProvider,
//   MemoryCacheProvider,
//   RedisCacheProvider,
//   streamStyledComponentsPlugin,
//   stringStyledComponentsPlugin,
// };

module.exports = index;
