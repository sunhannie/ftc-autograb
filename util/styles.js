const debug = require('debug')('ag:chart-style');
const fs = require('fs-jetpack');
const path = require('path');
const postcss = require('postcss');
const nested = require('postcss-nested');
const cssvariables = require('postcss-css-variables');
const cssnano = require('cssnano');

async function styles(input) {
  const src = path.resolve(process.cwd(), input);
  const mycss = await fs.readAsync(src);
  debug(`Processing ${src}...`);

  const result = await postcss([
      nested(),
      cssvariables(),
      cssnano({
        preset: 'default'
      })
    ])
    .process(mycss)

  return result.css;
}

if (require.main === module) {
  styles('client/chart.css')
    .then(result => {
      return fs.writeAsync('build/styles/chart.css', result);
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports = styles;