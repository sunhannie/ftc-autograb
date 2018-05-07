const debug = require('debug')('apn:home');
const Router = require('koa-router');
const router = new Router();
const render = require('../util/render.js');
const store = require('../util/store.js');

router.get('/', async function (ctx, next) {
  const lostCharts = await store.getLostChartStats();

  Object.assign(ctx.state, lostCharts);

  ctx.body = await render('stats.html', ctx.state);

  return await next();
});

module.exports = router;