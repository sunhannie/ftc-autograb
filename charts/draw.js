const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const d3 = require('d3');
const _ = require('lodash');
const translate = require('./translate.js');
const SVGStyles = require('./svg-styles.js');
// const cssLink = '<?xml-stylesheet type="text/css" href="https://ig.ft.com/graphics/bloomberg-economics/chart-style.css" ?>';

const chartWidth = 304;
const chartHeight = 270;

const margin = {
  top: 100,
  right: 48,
  bottom: 50,
  left: 1
};

const plotWidth = chartWidth - margin.left - margin.right;
const plotHeight = chartHeight - margin.top - margin.bottom;

const keyLineLength = 25;
const keyElementHeight = 20;

function convertTime(str) {
  const parse = d3.timeParse('%d %b %Y');
  const format = d3.timeFormat('%Y年%-m月%-d日');
  return format(parse(str));
}

function draw(data, style=null) {
  const {window} = new JSDOM(`<!DOCTYPE html><body></body></html>`);

  window.d3 = d3.select(window.document);

  const body = window.d3.select('body');
  const svg = body.append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`);
// add styles if exists      
  if (style) {
    svg.append('style')
      .text(`/* <![CDATA[ */${style}/* ]]> */`);
  }

// add text
  svg.append('text')
      .classed('chart-title', true)
      .attr('y', 22)
      .text(translate(data.title));

  svg.append('text')
      .attr('class', 'chart-subtitle')
      .attr('y', 42)
      .text(translate(data.subtitle));

  svg.append('text')
      .attr('class', 'chart-source')
      .attr('y', chartHeight - 5)
      .text(`来源:${translate(data.source)}. ${convertTime(data.updated)}`);

// line's container
  const container = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const seriesKeys = _.map(data.y.series, 'key');

// caculate domain
  if (!data.xDomain) {
    data.xDomain = d3.extent(data.data, d => new Date(d[data.x.series]));
  }

  if (!data.yDomain) {
    data.yDomain = [];
    data.yDomain[0] = d3.min(data.data, (d) => {
      const values = seriesKeys.map(key => {
        return Math.floor(Number(d[key]));
      });
      return d3.min(values);
    });

    data.yDomain[1] = d3.max(data.data, (d) => {
      const values = seriesKeys.map(key => {
        return Math.ceil(Number(d[key]));
      });
      return d3.max(values);
    });
  }

  const xScale = d3.scaleTime()
      .domain(data.xDomain)
      .range([0, plotWidth])
      .nice();

  const yScale = d3.scaleLinear()
      .domain(data.yDomain)
      .range([plotHeight, 0]);

// add axis
  const xAxis = d3.axisBottom(xScale)
    .ticks(5)
    .tickSizeOuter(0);

  const yAxis = d3.axisRight(yScale)
    .ticks(4)
    .tickSize(-plotWidth)
    .tickSizeOuter(0);


  container.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${plotHeight})`)
      .call(xAxis);

  container.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${plotWidth},0)`)
      .call(yAxis)
      .call(g => {
        if (data.highlightvalue <= yScale.domain()[1] && data.highlightvalue >= yScale.domain()[0]) {
          g.append('line')
              .attr('class', 'highlight-line')
              .attr('x1', 0)
              .attr('y1', yScale(data.highlightvalue))
              .attr('x2', -plotWidth)
              .attr('y2', yScale(data.highlightvalue));
        }
      });

// add legend
  if (seriesKeys.length > 1) {
    const keyElements = container.append('g')
        .attr('class', 'chart-key')
        .attr('transform', 'translate(0, -35)')
        .selectAll('g')
        .data(data.y.series)
      .enter().append('g')
        .attr('class', 'key-element')
        .attr('transform', (d, i) => `translate(0,${i * keyElementHeight})`);

    keyElements.append('text')
        .attr('x', keyLineLength + 3)
        .attr('font-size', SVGStyles.keyTextSize)
        .text(d => (translate(d.label)));

    keyElements.append('line')
        .attr('x1', 0)
        .attr('x2', keyLineLength)
        .attr('y1', -keyElementHeight / (SVGStyles.keyTextSize / 3))
        .attr('y2', -keyElementHeight / (SVGStyles.keyTextSize / 3))
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke', (d ,i) => SVGStyles.seriesLineColours[i]);
  }

// add path
  const linesContainer = container.append('g');

  seriesKeys.forEach((key, i) => {
    const line = d3.line()
        .defined(d => d[key] != null && !isNaN(d[key]))
        .x(d => xScale(new Date(d.date)))
        .y(d => yScale(d[key]));

    linesContainer.append('path')
        .attr('d', line(data.data))
        .attr('fill', 'none')
        .attr('stroke', SVGStyles.seriesLineColours[i])
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 2); 
  });

  return String(body.html());
}

module.exports = draw;