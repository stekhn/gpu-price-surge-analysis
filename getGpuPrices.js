const fs = require('fs');
const request = require('request');
const async = require('async');

const gpus = require('./data/gpus.json');

async.eachLimit(gpus, 1, (gpu, callback) => {

  request('https://www.idealo.de/offerpage/pricechart/api/' + gpu.id + '?period=P1Y',
    (error, response, body) => {

      if (error && response.statusCode != '200') {

        console.error(error);
      } else {

        const data = JSON.parse(body).data;
        gpu.prices = data;

        console.log(`Received ${data.length} prices for ${gpu.name}`);
      }

      callback();
    }
  );
}, (error) => {

  if (error) { console.error(error); }

  fs.writeFileSync('./data/gpus-prices.json', JSON.stringify(gpus, 0, 2), 'utf8');

  console.log(`Downloaded prices for ${gpus.length} GPUs`);
});
