'use strict';

/**
 * This is a Node.JS application to Add a new Drug
 */

const helper = require('./contractHelper');

async function main(organization,drugName, serialNo, mfgDate, expDate, companyCRN) {

	try {
		const pharmaContract = await helper.getContractInstance(organization,"manufacturer");

		// Add a new Drug 
		console.log('.....Add a new Drug');
		// addDrug (drugName, serialNo, mfgDate, expDate, companyCRN)
		const drugBuffer = await pharmaContract.submitTransaction('addDrug', drugName, serialNo, mfgDate, expDate, companyCRN);

		// process response
		console.log('.....Processing Add a new Drug Transaction Response\n\n');
		let newDrug = JSON.parse(drugBuffer.toString());
		console.log(newDrug);
		console.log('\n\n.....Add a new Drug Transaction Complete!');
		return newDrug;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}


module.exports.execute =main;