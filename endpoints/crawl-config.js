const debug = require('debug')('ag:crawl-config');
const got = require('got');
const writeJsonFile = require('write-json-file');
const uri = require('../util/uri.js');

/**
 * @example
 * const configCrawler = await CrawlConfig.init();
 * configCrawler.data
 */
class CrawlConfig {
  constructor(url=uri.nightingale) {
    this.url = url;
  }

  /**
   * @return {Promise<Object[]>}
   */
  async fetch() {
    debug(`Fetching: ${this.url}`);
    const start = new Date();
    this.data = await got(this.url, {
        json: true
      })
      .then(res => {
        return res.body;
      });
    const end = new Date();

    debug(`Length of nightingale-config.json: ${this.data.length}`);
    debug(`Time used ${(end - start)/1000}s`);
    return this.data;
  }
/**
 * @desc Save the fetched json
 */
  async save() {
    if (!this.data) {
      await this.fetch();
    }
    debug(`Saving ${uri.svgConfig}`);
    return await writeJsonFile(uri.svgConfig, this.data);
  }

  static async init() {
    const crawler = new CrawlConfig();
    await crawler.fetch();
    await crawler.save();
    return crawler;
  }
}

if (require.main == module) {
  CrawlConfig.init()
    .catch(err => {
      console.log(err);
    });
}

module.exports = CrawlConfig;