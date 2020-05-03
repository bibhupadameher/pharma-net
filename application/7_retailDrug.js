'use strict';

/**
 * This is a Node.JS application to retail Drug
 */

const helper = require('./contractHelper');

async function main(organization,drugName, serialNo, retailerCRN, customerAadhar) {

	try {
		const pharmaContract = await helper.getContractInstance(organization,"retailer");

		// retail Drug 
		console.log('.....retail Drug');
		//  retailDrug (drugName, serialNo, retailerCRN, customerAadhar)
		const drugBuffer = await pharmaContract.submitTransaction('retailDrug',drugName, serialNo, retailerCRN, customerAadhar);

		// process response
		console.log('.....Processing retail Drug Transaction Response\n\n');
		let updatedDrug = JSON.parse(drugBuffer.toString());
		console.log(updatedDrug);
		console.log('\n\n.....retail Drug Transaction Complete!');
		return updatedDrug;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

module.exports.execute =main;