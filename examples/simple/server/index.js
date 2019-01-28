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
