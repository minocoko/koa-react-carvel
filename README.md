# react-carvel
A painless react server side rendering middleware

### Features
* stream & string mode rendering
* gzip compression on stream & string rendering
* rendering cache
* styled-component & sass & less
* cookie & token base credential
* only few change when apply to exists or new react project
* base on koa


### Usage

    base on project create by create-react-app & react-router-dom


* install packages
    ```javascript
    yarn add react-carvel react react-dom react-router-dom koa koa-router koa-static
    ```

* separate client & server root.js

    use BrowserRouter at client side & use StaticRouter at server side
    root-client.js
    ```javascript
    import React from 'react';
    import { BrowserRouter } from 'react-router-dom';
    import App from './App';

    export default function rootClient({ store }) {
        return (
            <BrowserRouter>
                <App />
            </BrowserRouter>
        )
    };
    ```

    root-server.js
    ```javascript
    import React from 'react';
    import PropTypes from 'prop-types';
    import { StaticRouter } from 'react-router-dom';
    import App from './App';

    export default function rootServer({ location, context }) {
        return (
            <StaticRouter location={location} context={context}>
                <App />
            </StaticRouter>
        )
    };

    ```
* update index.js

    use root-client and render elements with hydrate or render accordingly
    ```javascript
    import React from 'react';
    import ReactDOM from 'react-dom';
    import Root from './root-client';
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
* create server & use react-carvel middleware

    TBD

* start server

    now ssr is working

### options

    TBD

### License

    MIT © [Minocoko](mailto:minocoko@outlook.com)