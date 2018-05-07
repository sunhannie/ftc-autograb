const debug = require('debug')('ag:server-errors');
const render = require('../util/render.js');

const messages = {
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Server Error'
};

async function handleErrors (ctx, next) {
  debug(`handle error middleware`)
  try {
// Catch all errors from downstream    
    await next();
  } catch (e) {
    debug(e);
    const status = e.status || 500;
// Do not output error detail in production env.
    ctx.state.message = e.message;
    if (process.env.NODE_ENV !== 'production') {
      ctx.state.error = e;
    }
    // ctx.response.status = status;
    ctx.body = await render('errors.html', ctx.state);
    return;
  }
}

module.exports = handleErrors;