'use strict';

const Po = require('../models/po.js');

class PoList {

	constructor(ctx) {
		this.ctx = ctx;
		this.name = 'org.pharma-network.pharmanet.lists.po';
	}

	/**
	 * Returns the Po model stored in blockchain identified by this key
	 * @param PoKey
	 * @returns {Promise<Po>}
	 */
	async getPo(poKey) {
		let poCompositeKey = this.ctx.stub.createCompositeKey(this.name, poKey.split(':'));
		let poBuffer = await this.ctx.stub.getState(poCompositeKey);
		return Po.fromBuffer(poBuffer);
	}



	/**
	 * Adds a po model to the blockchain
	 * @param poObject {Po}
	 * @returns {Promise<void>}
	 */
	async addPo(poObject) {

		let poCompositeKey = this.ctx.stub.createCompositeKey(this.name, poObject.getKeyArray());
		let poBuffer = poObject.toBuffer();
		await this.ctx.stub.putState(poCompositeKey, poBuffer);
		


	}


	/**
	 * Updates a po model on the blockchain
	 * @param poObject {Po}
	 * @returns {Promise<void>}
	 */
	async updatePo(poObject) {
		let poCompositeKey = this.ctx.stub.createCompositeKey(this.name, poObject.getKeyArray());
		let poBuffer = poObject.toBuffer();
		await this.ctx.stub.putState(poCompositeKey, poBuffer);
	}
}

module.exports = PoList;