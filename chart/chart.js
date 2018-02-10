document.addEventListener('DOMContentLoaded', init, false);

var width = 800;
var height = 400;

var margin = { top: 10, right: 45, bottom: 20, left: 45 };

function init() {

  var chart = drawChart();

  d3.json('data/gpu-percentages.json', function (data) {

    data.push({ key: 'average', value: getAverage(data) });
    var scale = drawAxis(data, chart, true);
    drawLines(data, chart, scale, 'dodgerblue');
  });

  d3.json('data/currency-percentages.json', function (data) {

    data.push({ key: 'average', value: getAverage(data) });
    var scale = drawAxis(data, chart, false);
    drawLines(data, chart, scale, 'tomato');
  });
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

function drawAxis(data, chart, draw) {

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

  if (draw) {

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
  }

  return {
    x: xScale,
    y: yScale
  };
}

function drawLines(data, chart, scale, color) {

  var line = d3.line()
    .x(function (d) { return scale.x(new Date(d.date)); })
    .y(function (d) { return scale.y(d.price); })
    .curve(d3.curveCardinal);

  var lines = chart.selectAll('.line')
      .data(data)
      .enter()
    .append('path')
      .attr('fill', 'none')
      .attr('stroke', color)
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
