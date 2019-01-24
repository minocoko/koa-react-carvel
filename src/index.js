import fs from 'fs';
import { matchPath } from 'react-router-dom';

const DIV_END_TAG_LENGTH = '</div>'.length;


export default (config) => {
  const {
    buildPath,
    template,
    rootElementId,
    route,
    cache,
    render,
    plugins,
  } = config;
  const homeContent = fs.readFileSync(`${buildPath}/${template}`).toString();
  const rootElement = `<div id="${rootElementId}">`;
  const indexOfRootElement = homeContent.indexOf(rootElement);
  const firstPartOfHomePageContent = homeContent.substring(0, indexOfRootElement + rootElement.length);
  const lastPartOfHomePageContent = homeContent.substring(indexOfRootElement + rootElement.length + DIV_END_TAG_LENGTH);

  /* eslint-disable-next-line */
  const handler = async (ctx, next) => {
    const { url } = ctx.req;
    const currentRoute = route.routes.find(item => matchPath(url, item));
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
};
