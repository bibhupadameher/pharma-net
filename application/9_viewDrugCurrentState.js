'use strict';

/**
 * This is a Node.JS application to view Drug Current State
 */

const helper = require('./contractHelper');

async function main(organization,drugName, serialNo) {

	try {
		const pharmaContract = await helper.getContractInstance(organization,"all");

		// view Drug Current State 
		console.log('.....view Drug Current State');
		//  viewDrugCurrentState (drugName, serialNo)
		const drugBuffer = await pharmaContract.submitTransaction('viewDrugCurrentState',drugName, serialNo);

		// process response
		console.log('.....Processing view Drug Current State Transaction Response\n\n');
		let newDrug = JSON.parse(drugBuffer.toString());
		console.log(newDrug);
		console.log('\n\n.....view Drug Current State Transaction Complete!');
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