const debug = require('debug')('apn:home');
const Router = require('koa-router');
const router = new Router();
const moment = require('moment');
const render = require('../util/render.js');
const store = require('../util/store.js');

router.get('/', async function (ctx, next) {
  const [csvs, charts] = await Promise.all([
    store.getCsvStats(),
    store.getChartStats()
  ]);

  Object.assign(ctx.state, {
    csvs: csvs.map(isToday),
    charts: charts.map(isToday)
  })

  ctx.body = await render('home.html', ctx.state);

  return await next();
});

function isToday(o) {
  const timeZone = 'Asia/Shanghai';
  // Create a UTC time and explicitly convert to Beijing time.
  const today = moment.utc().utcOffset(8);
  // Convert modification time to Beijing time.
  const modifiedTime = moment.utc(new Date(o.lastModified)).utcOffset(8);

  return Object.assign({}, o, {
    isToday: modifiedTime.isSame(today, 'day'),
    lastModified: modifiedTime.format('YYYY年M月D日 HH:mm:ss')
  });
}

module.exports = router;