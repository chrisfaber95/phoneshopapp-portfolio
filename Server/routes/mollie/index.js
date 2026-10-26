const mollie = require('express').Router();

const bodyParser = require('body-parser');
mollie.use(bodyParser.urlencoded({ extended:  true }));
mollie.use(bodyParser.json());

const webhook = require('./webhook');

mollie.post('/webhook', webhook);


module.exports = mollie;