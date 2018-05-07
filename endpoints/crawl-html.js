const debug = require('debug')('ag:crawl-html');
const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs-jetpack');
const path = require('path');
const writeJsonFile = require('write-json-file');
const uri = require('../util/uri.js');

/**
 * @example
 * const crawleHTML = await CrawleHTML.init();
 * crawlHTML.csvStats
 * crawlHTML.svgStats
 */
class CrawlHTML {
  constructor(url = uri.autograph) {
    this.url = url;
  }
/**
 * @return {Promise<String>} - The HTML file
 */
  async fetch() {
    debug(`Fetching: ${this.url}`);
    this.html = await got(this.url)
      .then(res => {
        return res.body;
      });
  }
/**
 * @param {String} html 
 */
  async saveHTML() {
    if (!this.html) {
      await this.fetch();
    }
    const dest = `${uri.publicDir}/index.html`;
    debug(`Saving HTML file: ${dest}`);
    return await fs.writeAsync(dest, this.html);
  }
/**
 * @param {String} html 
 * @return {Object} - cheerio object
 */
  parse() {
    this.$ = cheerio.load(this.html);
  }
/**
 * @type {Object[]}
 * @example 
 * [
 *  {
 *    "name": "us-10yr-bond.csv",
 *    "size": "51kb", 
 *    "lastModified": "Tue, 17 Oct 2017 13:06:29 GMT"
 *  }
 * ]
 */
  get csvStats() {
    const rowEls = this.$('table.datasets').find('tr');
    
    return rowEls.map((index, row) => {
      const tdEls = this.$(row).children('td');
      const firstTdEl = tdEls.eq(0);
      const fileName = firstTdEl.children('a').text();
      const fileSize = firstTdEl.clone().children().remove().end().text();
      const lastModified = tdEls.eq(1).text();
      return {
        "name": fileName,
        "size": fileSize.trim(),
        "lastModified": lastModified
      }
    }).get();
  }
/**
 * @type {Object[]}
 * @example 
 * [{
 *  "name": "dollar-vs-euro.svg", 
 *  "lastModified": "Tue, 17 Oct 2017 13:07:22 GMT"
 * }]
 */
  get svgStats() {
    const chartEls = this.$('div.charts').find('div.chart');
    return chartEls.map((index, el) => {
      const fileUrl = this.$(el).children('object').attr('data');
      const fileName = path.basename(fileUrl);
      const lastModified = this.$(el).children('p')
        .eq(0)
        .children('small')
        .eq(0)
        .text();
      return {
        name: fileName,
        lastModified: lastModified
      }
    }).get();
  }

  async saveCsvStats() {
    debug(`Saving ${uri.csvStats}`);
    return await writeJsonFile(uri.csvStats, this.csvStats);
  }

  async saveSvgStats() {
    debug(`Saving ${uri.svgStats}`);
    return await writeJsonFile(uri.svgStats, this.svgStats);
  }
/**
 * @return {Promise<CrawleHTML>}
 */
  static async init() {
    const crawler = new CrawlHTML()
    await crawler.fetch();
    crawler.parse();
    await Promise.all([
      crawler.saveCsvStats(),
      crawler.saveSvgStats()
    ]);
    return crawler;
  }
}

if (require.main == module) {
  CrawlHTML.init()
    .then(crawler => {
      console.log(`CSV: ${crawler.csvStats.length}`);
      console.log(`SVG: ${crawler.svgStats.length}`);
    })
    .catch(err => {
      console.log(err);
    });
}


module.exports = CrawlHTML;