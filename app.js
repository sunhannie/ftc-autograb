const debug = require('debug')('ag:server');
const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const logger = require('koa-logger');
const uri = require('./util/uri.js');
const home = require('./server/home.js');
const stats = require('./server/stats');
const handleErrors = require('./server/handle-errors.js');
const inlineAndMinify = require('./server/inline-min.js');

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 4000;

app.proxy = true;
app.use(logger());

debug(`Build dir: ${uri.chartDir}`);
debug(`Public dir: ${uri.publicDir}`);
debug(`isProduction: ${isProduction}`);
if (process.env.NODE_ENV !== 'production') {
  app.use(require('koa-static')(uri.publicDir));
}

app.use(handleErrors);
app.use(async function (ctx, next) {
  ctx.state.env = {
    isProduction,
    iconPrefix: 'http://interactive.ftchinese.com/',
    chartPrefix: isProduction ? 'http://ig.ftchinese.com/autograph' : ''
  }
  await next();
});
app.use(inlineAndMinify);

router.use('/', home.routes());
router.use('/__stats', stats.routes());

app.use(router.routes());

const server = app.listen(port);
server.on('listening', () => {
	debug(`Client listening on port ${port}`);
});
// Logging server error.
server.on('error', (error) => {
  debug(error);
});