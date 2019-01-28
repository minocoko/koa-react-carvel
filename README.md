# koa-react-carvel
A painless react server side rendering middleware

## Features
* Stream & string mode rendering
* Gzip compression on stream & string rendering
* Rendering cache
* Styled-component & sass & less
* Cookie & token base credential
* Only few change when apply to exists or new react project
* use exists client routing
* Base on koa


## Usage

Base on project create by create-react-app & react-router-dom

* Install packages
    ```bash
    yarn add koa-react-carvel react react-dom react-router-dom \
    koa koa-router koa-static pm2
    ```

* Update index.js

    Use App.js and render elements with hydrate or render accordingly
    ```javascript
    import React from 'react';
    import ReactDOM from 'react-dom';
    import Root from './App';
    import * as serviceWorker from './serviceWorker';

    const rootElement = document.getElementById('root');
    const renderOrHydrate = rootElement.children.length ? 'hydrate' : 'render';
    ReactDOM[renderOrHydrate]((
        <Root />
    ), rootElement);

    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: http://bit.ly/CRA-PWA
    serviceWorker.unregister();

    ```

* Create server & use koa-react-carvel middleware

    server/index.js
    ```javascript
    import path from 'path';
    import Koa from 'koa';
    import serve from 'koa-static';
    import Router from 'koa-router';
    import carvel, { StreamRender } from 'koa-react-carvel';

    import Root from '../src/App';

    const ssrConfig = {
        buildPath: path.resolve('./build'),
        rootElementId: 'root',
        render: new StreamRender({
            root: Root
        })
    }
    const router = new Router();
    router.get('/', carvel(ssrConfig));

    const app = new Koa();

    app.use(router.routes());
    app.use(router.allowedMethods());
    app.use(serve(ssrConfig.buildPath));

    const port = parseInt(process.env.PORT, 10) || 4000;
    app.listen(port, () => {
        console.log(`Server has started at ${port}`);
    });

    ```

* update config & add build script

    add new path to config/paths.js
    ```javascript
    appSsrBuild: resolveApp('build-server'),
    appSsrIndexJs: resolveModule(resolveApp, 'server/index'),
    appSsr: resolveApp('server'),
    ```

    add new script to package.json
    ```javascript
    "watch:server": "node scripts/watch-server.js",
    "start:server": "pm2 start --no-daemon config/pm2.server.dev.config.js",
    "build:server": "node scripts/build-server.js",
    "server": "pm2 start config/pm2.server.prod.config.js",
    ```

    add new building files<br>
    add [config/pm2.server.dev.config.js](examples/simple/config/pm2.server.dev.config.js) <br>
    add [config/pm2.server.prod.config.js](examples/simple/config/pm2.server.prod.config.js) <br>
    add [config/webpack.config.server.js](examples/simple/config/webpack.config.server.js) <br>
    add [scripts/build-server.js](examples/simple/scripts/build-server.js) <br>
    add [scripts/watch-server.js](examples/simple/scripts/watch-server.js) <br>
    

* Start server & checking

    ```bash
    npm run build
    npm run build:server
    npm run server
    ```
    now ssr is working

## options

|   name            |   require     |   description                     |
|   -----------     |   ----------- |   -----------                     |
|   buildPath       |   true        |   path of client build            |
|   rootElementId   |   true        |   root react element of client    |
|   render          |   true        |   render instance                 |

## License

MIT © [Minocoko](mailto:minocoko@outlook.com)
