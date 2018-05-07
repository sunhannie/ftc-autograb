const debug = require('debug')('ag:store');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const uri = require('./uri.js');

exports.getSvgConfig = async function() {
  debug(`Getting ${uri.svgConfig}`);
  return await loadJsonFile(uri.svgConfig);
}

exports.getSvgStats = async function() {
  debug(`Getting ${uri.svgStats}`);
  return await loadJsonFile(uri.svgStats);
}

exports.getChartStats = async function() {
  debug(`Getting ${uri.chartStats}`);
  return await loadJsonFile(uri.chartStats);
}

exports.getLostChartStats = async function() {
  debug(`Getting ${uri.lostCharts}`);
  return await loadJsonFile(uri.lostCharts);
}

exports.getCsvStats = async function() {
  debug(`Getting ${uri.csvStats}`);
  return await loadJsonFile(uri.csvStats);
}

exports.saveGlossary = async function() {
  return await writeJsonFile(uri.glossary, json);
};

exports.getGlossary = async function() {
  return await loadJsonFile(uri.glossary);
};

