const fs = require('fs');
const d3 = require('d3');

const parseDate = d3.timeParse('%Y-%m-%d');

(function init() {

  getGpuPercantages();
  getCurrencyPercentages();
})();

function getGpuPercantages() {

  const gpuValues = require('./data/gpu-prices.json');

  let gpuPerc = average(gpuValues);

  gpuPerc.map(d => {
    d.value = percentageChange(d.value, 'price');
    return d;
  });

  fs.writeFileSync('./data/gpu-percentages.json', JSON.stringify(gpuPerc, 0, 2), 'utf8');
}

function getCurrencyPercentages() {

  const currencyValues = require('./data/currency-prices.json');

  let currencyPerc = currencyValues.map(d => {
    d.value.sort((a, b) => new Date(b.date) - new Date(a.date));
    d.value = percentageChange(d.value, 'close');
    return d;
  });

  fs.writeFileSync('./data/currency-percentages.json', JSON.stringify(currencyPerc, 0, 2), 'utf8');
}

function percentageChange(arr, key) {

  return arr.reduce((acc, curr) => {
    acc.diffs.push({
      date: curr.date,
      price: ((curr[key] - acc.prev) / acc.prev) * 100
    });
    return acc;
  }, {
    prev: arr[arr.length - 1][key],
    diffs: []
  }).diffs;
}

function average(data) {

  return d3.nest()
    .key(d => d.type)
    .rollup(d => d.reduce((acc, curr, i) => {
      curr.prices.forEach(price => {
        const date = parseDate(price.x);
        const pos = acc.map(obj => +obj.date).indexOf(+date);
        pos > -1 ?
          acc[pos].price = acc[pos].price + price.y / (i + 1) - acc[pos].price / (i + 1) :
          acc.push({ date, price: price.y });
      });

      return acc;
    }, []).sort((a, b) => b.date - a.date))
    .entries(data);
}
