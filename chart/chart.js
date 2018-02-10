document.addEventListener('DOMContentLoaded', init, false);

var width = 800;
var height = 500;

var margin = { top: 40, right: 60, bottom: 40, left: 60 };

var timeout;
var gpuData, currencyData;

function init() {

  var chart = drawChart();

  d3.json('data/gpu-percentages.json', function (data) {

    data.push({ key: 'average', value: getAverage(data) });
    gpuData = data;

    drawGpus(data, chart);
  });

  d3.json('data/currency-percentages.json', function (data) {

    data.push({ key: 'average', value: getAverage(data) });
    currencyData = data;

    drawCurrencies(data, chart);
  });

  window.addEventListener('resize', redraw, false);
}

function drawGpus(data, chart) {

  var current = {};

  current.data = data || gpuData;
  current.text = 'GPUs';
  current.color = 'dodgerblue';
  current.drawAxis = true;
  current.chart = chart;
  current.scale = drawAxis(current);
  current.lines = drawLines(current);
  current.marker = drawMarker(current);
}

function drawCurrencies(data, chart) {

  var current = {};

  current.data = data || currencyData;
  current.text = 'Cyptocurrencies';
  current.color = 'tomato';
  current.drawAxis = false;
  current.chart = chart;
  current.scale = drawAxis(current);
  current.lines = drawLines(current);
  current.marker = drawMarker(current);
}

function drawChart() {

  var container = d3.select('#chart');

  width = container.node().getBoundingClientRect().width;

  var svg = container
    .append('svg')
      .attr('width', width)
      .attr('height', height);

  var chart = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  return chart;
}

function drawAxis(current) {

  var xMax = d3.max(current.data, function (d) {
    return d3.max(d.value, function (c) {
      return new Date(c.date);
    });
  });

  var xScale = d3.scaleTime()
    .domain([new Date('2017-08-09'), xMax])
    .range([0, width - margin.left -margin.right]);

  var yScale = d3.scaleLinear()
    .domain([-100, 100])
    .range([height - margin.top -margin.bottom, 0]);

  if (current.drawAxis) {

    current.chart.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (height - margin.top - margin.bottom) + ')')
        .call(d3.axisBottom(xScale).ticks(5))
      .append('text')
        .attr('x', width)
        .attr('y', -10)
        .attr('fill', 'black')
        .style('text-anchor', 'end')
        .text('');

    current.chart.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(function (d) {
          return (d <= 0 ? '' : '+') + d + ' %';
        }))
      .append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'black')
        .style('text-anchor', 'end')
        .text('');
  }

  return {
    x: xScale,
    y: yScale
  };
}

function drawLines(current) {

  var line = d3.line()
    .x(function (d) {
      return current.scale.x(new Date(d.date));
    })
    .y(function (d) {
      return current.scale.y(d.price);
    })
    .curve(d3.curveCardinal);

  var lines = current.chart.selectAll('.line')
      .data(current.data)
      .enter()
    .append('path')
      .attr('fill', 'none')
      .attr('stroke', current.color)
      .attr('stroke-width', function (d) {
        return d.key == 'average' ? 3 : 1.5;
      })
      .attr('stroke-opacity', function (d) {
        return d.key == 'average' ? 1 : 0.2;
      })
      .attr('d', function (d) { return line(d.value); })
      .on('mouseenter', function(d) {
        console.log(d);
      });

  return lines;
}

function drawMarker(current) {

  var lastValue = current.data.filter(function (d) {
    return d.key == 'average'; }
  )[0].value[0];

  var marker = current.chart.append('g')
    .attr('transform', function () {
      return 'translate(' + current.scale.x(new Date(lastValue.date)) + ',' +
        current.scale.y(lastValue.price) +')';
    });

  marker.append('text')
    .attr('dx', '.5em')
    .attr('dy', '.25em')
    .attr('fill', current.color)
    .attr('text-anchor', 'start')
    .text('+' + Math.round(lastValue.price) + ' %');
}

function redraw () {

  clearTimeout(timeout);

  timeout = setTimeout(function () {

    d3.select('#chart').html('');

    var chart = drawChart();

    drawGpus(undefined, chart);
    drawCurrencies(undefined, chart);

  }, 500);
}

function getAverage(data) {

  return data.reduce((acc, curr, i) => {
    curr.value.forEach(function (d) {
      const pos = acc.map(obj => obj.date).indexOf(d.date);
      pos > -1 ?
        acc[pos].price = acc[pos].price + d.price / (i + 1) - acc[pos].price / (i + 1) :
        acc.push({ date: d.date, price: d.price });
    });

    return acc;
  }, []);
}
