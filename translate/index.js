const path = require('path');
const co = require('co');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const _ = require('lodash');
const keysToTransform = require('./keys.js');
const transform = require('./transform.js');

const configFile = path.resolve(__dirname, '../public/config/nightingale-config.json');
const glossaryFile = path.resolve(__dirname, '../glossary/en-cn.json');

function translate (sources) {
    return loadJsonFile(glossaryFile)
        .then(glossary => {
            transform(sources, keys, glossary)
            return sources;
        });
}

if (require.main == module) {
    co(function *() {
        const configs = yield loadJsonFile(configFile);

        const translatedText = yield translate(configs);

        yield writeJsonFile(path.resolve(__dirname, '../public/config/config-bi.json'), translatedText);
    })
    .catch(err => {
        console.log(err);
    });
}

module.exports = translate;