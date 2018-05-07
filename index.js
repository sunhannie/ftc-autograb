/*
 * Crawl data from http://ig.ft.com/autograph every two hours
 * Use the crawled data to drow svg 
 */
const debug = require('debug')('ag:index');
const later = require('later');
const Charts = require('./charts');

if (require.main === module) {
  
  Charts.init()
    .catch(err => {
      debug(err);
    });

  // Execute on evry day 2 hours between 0-8 UTC time.
  // const sched = later.parse.recur().on(0).hour();
  const sched = later.parse.recur().on(0,2,4,6,8).hour();

  later.setInterval(Charts.init, sched);  
}