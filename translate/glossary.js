// Extract english text to glossay.json.
const _ = require('lodash');
const endpoints = require('../endpoints');
const buildArtifacts = require('../util/build-artifacts.js');

const keysToExtract = require('./keys.js');

/*
 * Following `path` to find `keys`' value recursively.
 */
function extract(arr, keys) {
  return arr.map(obj => {
    return keys.map(key => {
      if (!(_.isPlainObject(key) || _.isString(key))) {
          return '';
      }
      if (_.isPlainObject(key)) {
          const nextLevelArr = _.propertyOf(obj)(key.path);            
          return extract(nextLevelArr, key.keys);
      }
      return obj[key];
    });
  });
}

// flatten the array. Use array element as key for glossary.
function arrayToObject(arr) {
  return _.flattenDeep(arr)
    .reduce((o, k) => {
        if (!o.hasOwnProperty(k)) {
            o[k] = '';
        }
        return o;
    }, {});
}

function buildGlossary(data, keys=keysToExtract) {
    const newGloss = arrayToObject(extract(data, keys));
    const newGlossNum = Object.keys(newGloss).length;

    return buildArtifacts.getGlossary()
      .then(oldGloss => {
        const oldGlossNum = Object.keys(oldGloss).length;

        console.log(`New glossary entries: ${newGlossNum - oldGlossNum}`);

// merge old glosaary into new.
        return Object.assign(newGloss, oldGloss);
      });
}

async function gatherGlossary() {
  let data;
  try {
    data = await buildArtifacts.getSvgConfig();
  } catch (e) {
    data = await endpoints.fetchJson();
  }

  try {
    const glossary = await buildGlossary(data);

    console.log(`Total glossary entries: ${Object.keys(glossary).length}`);

    await buildArtifacts.saveGlossary(glossary);

  } catch (e) {
    console.log(e);
  }
}

if (require.main == module) {
  gatherGlossary()
    .catch(e => {
      console.log(e);
    });
}

module.exports = gatherGlossary;