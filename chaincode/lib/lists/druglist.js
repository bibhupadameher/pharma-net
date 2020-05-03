'use strict';

const Drug = require('../models/drug.js');

class DrugList {

	constructor(ctx) {
		this.ctx = ctx;
		this.name = 'org.pharma-network.pharmanet.lists.drug';
		this.drugname = 'org.pharma-network.pharmanet.lists.drugname';
	}

	/**
	 * Returns the Drug model stored in blockchain identified by this key
	 * @param DrugKey
	 * @returns {Promise<Drug>}
	 */
	async getDrug(drugKey) {
		let drugCompositeKey = this.ctx.stub.createCompositeKey(this.name, drugKey.split(':'));
		let drugBuffer = await this.ctx.stub.getState(drugCompositeKey);
		return Drug.fromBuffer(drugBuffer);
	}
	/**
 * Returns the Drug model stored in blockchain identified by this key
 * @param DrugKey
 * @returns {Promise<Drug>}
 */
	async getDrugFromName(drugName) {
		const drugnameKey = this.ctx.stub.createCompositeKey(this.drugname, drugName.split(':'));
		let drugnameBuffer = await this.ctx.stub
			.getState(drugnameKey)
			.catch(err => console.log("invalid drug name"));
		let drugnameobj = JSON.parse(drugnameBuffer.toString());
		
		return drugnameobj;
	}


	/**
	 * Adds a drug model to the blockchain
	 * @param drugObject {Drug}
	 * @returns {Promise<void>}
	 */
	async addDrug(drugObject) {

		let keyArr = drugObject.getKeyArray();
		const drugnameKey = this.ctx.stub.createCompositeKey(this.drugname, [keyArr[0]]);
		// Create a Company CRN object to be stored in blockchain
		let newdrugnameObject = {
			name: keyArr[0],
		};
		// Convert the JSON object to a buffer and send it to blockchain for storage
		let drugnamedataBuffer = Buffer.from(JSON.stringify(newdrugnameObject));
		await this.ctx.stub.putState(drugnameKey, drugnamedataBuffer);

		let drugCompositeKey = this.ctx.stub.createCompositeKey(this.name, drugObject.getKeyArray());
		let drugBuffer = drugObject.toBuffer();
		await this.ctx.stub.putState(drugCompositeKey, drugBuffer);


	}

	/**
	 * Updates a drug model on the blockchain
	 * @param drugObject {Drug}
	 * @returns {Promise<void>}
	 */
	async updateDrug(drugObject) {
		let drugCompositeKey = this.ctx.stub.createCompositeKey(this.name, drugObject.getKeyArray());
		let drugBuffer = drugObject.toBuffer();
		await this.ctx.stub.putState(drugCompositeKey, drugBuffer);
	}
}

module.exports = DrugList;