'use strict';

const pharmacontract = require('./pharmacontract.js');
const manufacturercontract = require('./manufacturercontract.js');
const retailercontract = require('./retailercontract.js');
const transportercontract = require('./transportercontract.js');
const shipmentcontract = require('./shipmentcontract.js');
module.exports.contracts = [pharmacontract,manufacturercontract,retailercontract,transportercontract,shipmentcontract];
