const debug = require('debug')('ag:charts');
const writeJsonFile = require('write-json-file');
const fs = require('fs-jetpack');
const slug = require('speakingurl');
const filesize = require('filesize');
const moment = require('moment');
const draw = require('./draw.js');
const CrawlConfig = require('../endpoints/crawl-config');
const CrawlHTML = require('../endpoints/crawl-html');
const styles = require('../util/styles.js');
const uri = require('../util/uri.js');

/**
 * @desc 
 */
class Charts {
  constructor(styleFile=uri.chartStyle) {
    this.styleFile = styleFile;
    this.svgSizes = new Map();
    this.stats = [];
    this.missed = [];
  }

  async render(data) {
    const css = await styles(this.styleFile);

    await Promise.all(data.map(async (svg) => {
      const svgStr = draw(svg, css);
      const {filename, size} = await this.saveSvg(svg.title, svgStr);
      this.svgSizes.set(filename, size);
      return;
    }));
    debug(`Rendered ${this.svgSizes.size} charts.`);
  }

  gatherStats(svgStats) {
    svgStats.forEach(svg => {
      const svgName = svg.name;
      if (this.svgSizes.has(svgName)) {
        const size = this.svgSizes.get(svgName);
        this.stats.push(Object.assign({}, svg, {size}));
      } else {
        this.missed.push(svg);
      }
    });
    debug(`Lost charts: ${this.missed.length}`);
  }
/**
 * @param {String} name - White space separated string.
 * @param {String} svg - The svg string.
 * @return {Object}
 * @property {String} filename
 * @property {Number} size
 * @example
 * {
 *  "filename": "business-investment.svg",
 *  "size": 10
 * }
 */
  async saveSvg(name, svg) {
    const filename = `${slug(name)}.svg`;
    const dest = `${uri.graphicsDir}/${filename}`;
    await fs.writeAsync(dest, svg);
    return {filename, size: filesize(Buffer.byteLength(svg), {round: 0})};
  };

  async saveStats() {
    debug(`Saving ${uri.chartStats}`);
    return await writeJsonFile(uri.chartStats, this.stats);
  }
/**
 * Save an object {lastUpdated: "", lostCharts: []}
 */
  async saveMissed() {
    debug(`Saving ${uri.lostCharts}`);
    const now = moment.utc().utcOffset(8).format();
    return await writeJsonFile(uri.lostCharts, {lastUpdated: now, lostCharts: this.missed});
  }

  static async init() {
    const charts = new Charts();

    const [configCrawler, htmlCrawler] = await Promise.all([
      CrawlConfig.init(),
      CrawlHTML.init()
    ]);

    await charts.render(configCrawler.data);
    charts.gatherStats(htmlCrawler.svgStats);

    await Promise.all([
      charts.saveStats(),
      charts.saveMissed()
    ]);

    return charts;
  }
}

if (require.main == module) {
  Charts.init()
    .catch(err => {
      console.log(err);
    });
}

module.exports = Charts;