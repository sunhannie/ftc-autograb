const path = require('path');
const interpreter = path.resolve(process.env.HOME, 'n/n/versions/node/8.7.0/bin/node');

module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : "autograph-server",
      script    : "app.js",
      interpreter: interpreter,
      env: {
        NODE_ENV: "development",
        PORT: 4000
      },
      env_production : {
        NODE_ENV: "production",
        CHART_DIR: '/opt/nodestatic/autograph',
        DEBUG: 'ag*'
      },
      max_restart: 10,
      error_file: path.resolve(process.env.HOME, 'logs/autograph-server-err.log'),
      out_file: path.resolve(process.env.HOME, 'logs/autograph-server-out.log')
    },

    // Second application
    // Crawler should always write log in truncate mode rather than append
    {
      name      : "autograph-crawler",
      script    : "index.js",
      interpreter: interpreter,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        CHART_DIR: '/opt/nodestatic/autograph',
        DEBUG: 'ag*'
      },
      error_file: path.resolve(process.env.HOME, 'logs/autograph-crawler-err.log'),
      out_file: path.resolve(process.env.HOME, 'logs/autograph-crawler-out.log')
    }
  ]
}
