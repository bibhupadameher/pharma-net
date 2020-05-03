'use strict';

/**
 * This is a Node.JS application to create Shipment
 */

const helper = require('./contractHelper');

async function main(organization,buyerCRN, drugName, listOfAssets, transporterCRN) {

	try {
		const pharmaContract = await helper.getContractInstance(organization,"shipment");

		// Create create Shipment 
		console.log('.....create Shipment');
		//  createShipment (buyerCRN, drugName, listOfAssets, transporterCRN )
		const shipmentBuffer = await pharmaContract.submitTransaction('createShipment',buyerCRN, drugName, listOfAssets, transporterCRN);

		// process response
		console.log('.....Processing create Shipment Transaction Response\n\n');
		let newShipment = JSON.parse(shipmentBuffer.toString());
		console.log(newShipment);
		console.log('\n\n.....create Shipment Transaction Complete!');
		return newShipment;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

module.exports.execute =main;