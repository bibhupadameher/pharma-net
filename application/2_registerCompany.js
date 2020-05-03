'use strict';

/**
 * This is a Node.JS application to register a company
 */

const helper = require('./contractHelper');

async function main(organization,companyCRN, companyName, Location, organisationRole) {

	try {
		const pharmaContract = await helper.getContractInstance(organization,"all");

		// Register a new company 
		console.log('.....Register a new company');
		// registerCompany(ctx, companyCRN, companyName, location, organisationRole)
		const companyBuffer = await pharmaContract.submitTransaction('registerCompany', companyCRN, companyName, Location, organisationRole);

		// process response
		console.log('.....Processing register Company Transaction Response\n\n');
		let newCompany = JSON.parse(companyBuffer.toString());
		console.log(newCompany);
		console.log('\n\n.....register Company Transaction Complete!');

		return newCompany;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

module.exports.execute =main;