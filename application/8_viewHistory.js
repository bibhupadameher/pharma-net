'use strict';

/**
 * This is a Node.JS application to view History
 */

const helper = require('./contractHelper');

async function main(organization,drugName, serialNo) {

	try {
		const pharmaContract = await helper.getContractInstance(organization,"all");

		// view History 
		console.log('.....view History');
		//  viewHistory (drugName, serialNo)
		const drugBuffer = await pharmaContract.submitTransaction('viewHistory',drugName, serialNo);

		// process response
		console.log('.....Processing view History Transaction Response\n\n');
		let drug = JSON.parse(drugBuffer.toString());
		console.log(drug);
		console.log('\n\n.....view History Transaction Complete!');
		return drug;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}


module.exports.execute =main;