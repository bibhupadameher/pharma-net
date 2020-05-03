'use strict';

/**
 * This is a Node.JS application to update Shipment
 */

const helper = require('./contractHelper');

async function main(organization,buyerCRN, drugName, transporterCRN) {

	try {
		const pharmaContract = await helper.getContractInstance(organization,"transport");

		// update Shipment 
		console.log('.....update Shipment');
		//  updateShipment( buyerCRN, drugName, transporterCRN)
		const shipmentBuffer = await pharmaContract.submitTransaction('updateShipment',buyerCRN, drugName, transporterCRN);

		// process response
		console.log('.....Processing update Shipment Transaction Response\n\n');
		let updatedShipment = JSON.parse(shipmentBuffer.toString());
		console.log(updatedShipment);
		console.log('\n\n.....update Shipment Transaction Complete!');
		return updatedShipment;
	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

module.exports.execute =main;