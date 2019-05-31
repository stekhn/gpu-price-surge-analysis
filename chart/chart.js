document.addEventListener('DOMContentLoaded', init, false);

var width = 800;
var height = 500;
var breakpoint = 640;
var isMobile = false;

var margin = { top: 10, right: 50, bottom: 30, left: 50 };

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

  drawAnnotations(current);
}

function drawChart() {

  var container = d3.select('#chart');

  width = container.node().getBoundingClientRect().width;
  isMobile = width <= breakpoint;

  var svg = container
    .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', '0 0 ' + width + ' ' + height);

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
    .range([0, width - margin.left - margin.right]);

  var yScale = d3.scaleLinear()
    .domain([-95, isMobile ? 375 : 250])
    .range([height - margin.top - margin.bottom, 0]);

  if (current.drawAxis) {

    current.chart.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (height - margin.top - margin.bottom) + ')')
      .call(d3.axisBottom(xScale).ticks(5));

    current.chart.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(function (d) {
        return (d <= 0 ? '' : '+') + d + ' %';
      }));
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
    .curve(d3.curveMonotoneX);

  var lines = current.chart.append('g')
      .attr('class', 'lines ' + current.text.toLowerCase())
    .selectAll('.line')
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
      .attr('d', function (d) { return line(d.value); });

  return lines;
}

function drawMarker(current) {

  var lastValue = current.data.filter(function (d) {
    return d.key == 'average'; }
  )[0].value[0];

  var marker = current.chart.append('g')
    .attr('class', 'marker')
    .attr('transform', function () {
      return 'translate(' + current.scale.x(new Date(lastValue.date)) + ',' +
        current.scale.y(lastValue.price) +')';
    });

  marker.append('text')
    .attr('dx', '.5em')
    .attr('dy', '.25em')
    .attr('fill', current.color)
    .attr('text-anchor', 'start')
    .attr('font-weight', 'bold')
    .text('+' + Math.round(lastValue.price) + ' %');

  return marker;
}

function drawAnnotations(current) {

  var annotations = [
    {
      note: {
        title: 'China cracks down on cryptocurrencies',
        padding: 8,
        wrap: 160
      },
      subject: { radius: 50, radiusPadding: 10 },
      data: {
        date: '2017-09-14T00:00:00.000Z',
        price: -23.865453333834303
      },
      disable: 'subject',
      connector: { end: 'dot' },
      color: 'black',
      dy: isMobile ? 1 : 25,
      dx: 50
    }, {
      note: {
        title: 'Bitcoin reaches all-time high',
        padding: 8,
        wrap: 160
      },
      data: {
        date: '2017-12-16T00:00:00.000Z',
        price: 264.40001995658275
      },
      disable: 'subject',
      connector: { end: 'dot' },
      color: 'black',
      dy: isMobile ? 25 : 75,
      dx: isMobile ? -50 : -75
    }, {
      note: {
        title: 'Bitcoin drops 50 % in two weeks',
        padding: 8,
        wrap: 160
      },
      data: {
        date: '2018-02-05T00:00:00.000Z',
        price: 100.12290999653442
      },
      disable: 'subject',
      connector: { end: 'dot' },
      color: 'black',
      dy: 25,
      dx: -50
    }
  ];

  var makeAnnotations = d3.annotation()
    .type(d3.annotationCallout)
    .accessors({
      x: function (d) { return current.scale.x(new Date(d.date)); },
      y: function (d) { return current.scale.y(d.price); }
    })
    .annotations(annotations);

  var annotationsEl = current.chart.append('g')
    .attr('class', 'annotations')
    .call(makeAnnotations);

  return annotationsEl;
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
      var pos = acc.map(obj => obj.date).indexOf(d.date);
      pos > -1 ?
        acc[pos].price = acc[pos].price + d.price / (i + 1) - acc[pos].price / (i + 1) :
        acc.push({ date: d.date, price: d.price });
    });

    return acc;
  }, []);
}
