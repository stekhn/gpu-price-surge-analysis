document.addEventListener('DOMContentLoaded', init, false);

var width = 800;
var height = 400;

var margin = { top: 10, right: 45, bottom: 20, left: 45 };

function init() {

  var chart = drawChart();

  drawGpus(chart);
  drawCurrencies(chart);
}

function drawChart() {

  var svg = d3.select('#chart')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

  var chart = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  return chart;
}

function drawGpus(chart) {

  d3.json('data/gpu-percentages.json', function (data) {

    console.log('GPU', data);

    var xMax = d3.max(data, function (d) {
      return d3.max(d.value, function (c) {
        return new Date(c.date);
      });
    });

    var xScale = d3.scaleTime()
      .domain([new Date('2017-08-09'), xMax])
      .range([0, width]);

    var yScale = d3.scaleLinear()
      .domain([-50, 50])
      .range([height, 0]);

    var line = d3.line()
      .x(function (d) { return xScale(new Date(d.date)); })
      .y(function (d) { return yScale(d.price); })
      .curve(d3.curveCardinal);

    chart.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale).ticks(5))
      .append('text')
        .attr('x', width)
        .attr('y', -10)
        .attr('fill', 'black')
        .style('text-anchor', 'end')
        .text('');

    chart.append('g')
        .call(d3.axisLeft(yScale).ticks(5))
      .append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'black')
        .style('text-anchor', 'end')
        .text('');

    chart.selectAll('.line')
        .data(data)
        .enter()
      .append('path')
        .attr('fill', 'none')
        .attr('stroke', 'dodgerblue')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', .8)
        .attr('d', function (d) { return line(d.value); })
        .on('mouseenter', function(d) {
          console.log(d);
        });
  });
}

function drawCurrencies(chart) {

  d3.json('data/currency-percentages.json', function (data) {

    console.log('CUR', data);

    var xMax = d3.max(data, function (d) {
      return d3.max(d.value, function (c) {
        return new Date(c.date);
      });
    });

    var xScale = d3.scaleTime()
      .domain([new Date('2017-08-09'), xMax])
      .range([0, width]);

    var yScale = d3.scaleLinear()
      .domain([-100, 100])
      .range([height, 0]);

    var line = d3.line()
      .x(function (d) { return xScale(new Date(d.date)); })
      .y(function (d) { return yScale(d.price); })
      .curve(d3.curveCardinal);

    chart.append('g')
        .attr('transform', 'translate(' +width +',0)')
        .call(d3.axisRight(yScale).ticks(5))
      .append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'black')
        .style('text-anchor', 'end')
        .text('');

    chart.selectAll('.line')
        .data(data)
        .enter()
      .append('path')
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', .8)
        .attr('d', function (d) {
          return line(d.value);
        })
        .on('mouseenter', function(d) {
          console.log(d);
        });

  });
}
