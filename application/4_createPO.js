'use strict';

/**
 * This is a Node.JS application to Create PO
 */

const helper = require('./contractHelper');

async function main(organization,buyerCRN, sellerCRN, drugName, quantity) {

	try {
		const pharmaContract = await helper.getContractInstance(organization,"shipment");

		// Create PO 
		console.log('.....Create PO');
		//  createPO (buyerCRN, sellerCRN, drugName, quantity)
		const poBuffer = await pharmaContract.submitTransaction('createPO',buyerCRN, sellerCRN, drugName, quantity);

		// process response
		console.log('.....Processing Create PO Transaction Response\n\n');
		let newPO = JSON.parse(poBuffer.toString());
		console.log(newPO);
		console.log('\n\n.....Create PO Transaction Complete!');
		return newPO;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

module.exports.execute =main;