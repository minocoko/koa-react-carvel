# react-carvel
A painless react server side rendering middleware

### Features
* Stream & string mode rendering
* Gzip compression on stream & string rendering
* Rendering cache
* Styled-component & sass & less
* Cookie & token base credential
* Only few change when apply to exists or new react project
* Base on koa


### Usage

    Base on project create by create-react-app & react-router-dom

* Install packages
    ```bash
    yarn add react-carvel react react-dom react-router-dom \
    koa koa-router koa-static
    ```

* Create client & server root.js, wrap App element

    use BrowserRouter at client side & use StaticRouter at server side

    src/root-client.js
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

    src/root-server.js
    ```javascript
    import React from 'react';
    import PropTypes from 'prop-types';
    import { StaticRouter } from 'react-router-dom';
    import App from './App';

    rootServer.PropTypes = {
        location: PropTypes.object,
        context: PropTypes.object,
    }

    export default function rootServer({ location, context }) {
        return (
            <StaticRouter location={location} context={context}>
                <App />
            </StaticRouter>
        )
    };

    ```
* Udate index.js

    Use root-client and render elements with hydrate or render accordingly
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
* Create server & use react-carvel middleware

    TBD
    server/index.js
    ```javascript
    
    ```

* Start server & checking

    now ssr is working

### options

    TBD

### License

  MIT © [Minocoko](mailto:minocoko@outlook.com)
