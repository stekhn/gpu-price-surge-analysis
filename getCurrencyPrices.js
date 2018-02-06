const fs = require('fs');
const request = require('request');
const async = require('async');

const currencies = require('./data/currencies.json');

async.eachLimit(currencies, 1, (currency, callback) => {

  // API documentation: https://min-api.cryptocompare.com/
  request('https://min-api.cryptocompare.com/data/histoday?fsym=' + currency.id +'&tsym=EUR&limit=160&aggregate=1',
    (error, response, body) => {

      if (error && response.statusCode != '200') {

        console.error(error);
      } else {


        const data = JSON.parse(body).Data;

        currency.prices = data;
        currency.prices.forEach(price => { price.date = new Date(price.time * 1000).toISOString(); });

        console.log(`Received ${data.length} prices for ${currency.name}`);
      }

      callback();
    }
  );
}, (error) => {

  if (error) { console.error(error); }

  fs.writeFileSync('./data/currencies-prices.json', JSON.stringify(currencies, 0, 2), 'utf8');

  console.log(`Downloaded prices for ${currencies.length} currencies`);
});
