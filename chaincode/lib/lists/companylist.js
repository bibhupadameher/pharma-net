'use strict';

const Company = require('../models/company.js');

class CompanyList {

	constructor(ctx) {
		this.ctx = ctx;
		this.name = 'org.pharma-network.pharmanet.lists.company';
		this.crnname = 'org.pharma-network.pharmanet.lists.companycrn';
	}

	/**
	 * Returns the Company model stored in blockchain identified by this key
	 * @param CompanyKey
	 * @returns {Promise<Company>}
	 */
	async getCompany(companyKey) {
		let companyCompositeKey = this.ctx.stub.createCompositeKey(this.name, companyKey.split(':'));
		let companyBuffer = await this.ctx.stub.getState(companyCompositeKey);
		return Company.fromBuffer(companyBuffer);
	}

	/**
 * Returns the Company model stored in blockchain identified by this key
 * @param CompanyKey
 * @returns {Promise<Company>}
 */
	async getCompanyFromCRN(companycrn) {

		const crnKey = this.ctx.stub.createCompositeKey(this.crnname, companycrn.split(':'));
		console.log("crnKey "+crnKey);
		let companycrnBuffer = await this.ctx.stub
			.getState(crnKey)
			.catch(err => console.log("invalid CRN"));
			console.log("companycrnBuffer "+companycrnBuffer.toString());
		let companycrnobj = JSON.parse(companycrnBuffer.toString());
		let companyName = companycrnobj.name.toString();
		console.log("companyName "+companyName);
		companyName = companyName.split('"').join('');
		companycrn = companycrn.split('"').join('');
		const manufacturerKey = Company.makeKey([companycrn, companyName]);
		console.log("manufacturerKey "+manufacturerKey);		
		let companyCompositeKey = this.ctx.stub.createCompositeKey(this.name, manufacturerKey.split(':'));
		let companyBuffer = await this.ctx.stub.getState(companyCompositeKey);
		return Company.fromBuffer(companyBuffer);
	}


	/**
	 * Adds a company model to the blockchain
	 * @param companyObject {Company}
	 * @returns {Promise<void>}
	 */
	async addCompany(companyObject) {


		let keyArr = companyObject.getKeyArray();
		const crnKey = this.ctx.stub.createCompositeKey(this.crnname, [keyArr[0]]);
		console.log("crnKey "+crnKey);
		// Create a Company CRN object to be stored in blockchain
		let newCompanyCRNObject = {
			name: keyArr[1],
			companyCRN: keyArr[0],
		};
		// Convert the JSON object to a buffer and send it to blockchain for storage
		let crndataBuffer = Buffer.from(JSON.stringify(newCompanyCRNObject));
		await this.ctx.stub.putState(crnKey, crndataBuffer);


		let companyCompositeKey = this.ctx.stub.createCompositeKey(this.name, companyObject.getKeyArray());
		let companyBuffer = companyObject.toBuffer();
		await this.ctx.stub.putState(companyCompositeKey, companyBuffer);



	}


	/**
	 * Updates a company model on the blockchain
	 * @param companyObject {Company}
	 * @returns {Promise<void>}
	 */
	async updateCompany(companyObject) {
		let companyCompositeKey = this.ctx.stub.createCompositeKey(this.name, companyObject.getKeyArray());
		let companyBuffer = companyObject.toBuffer();
		await this.ctx.stub.putState(companyCompositeKey, companyBuffer);
	}
}

module.exports = CompanyList;