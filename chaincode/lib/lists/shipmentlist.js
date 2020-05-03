'use strict';

const Shipment = require('../models/shipment.js');

class ShipmentList {

	constructor(ctx) {
		this.ctx = ctx;
		this.name = 'org.pharma-network.pharmanet.lists.shipment';
	}

	/**
	 * Returns the Shipment model stored in blockchain identified by this key
	 * @param ShipmentKey
	 * @returns {Promise<Shipment>}
	 */
	async getShipment(shipmentKey) {
		let shipmentComshipmentsiteKey = this.ctx.stub.createCompositeKey(this.name, shipmentKey.split(':'));
		let shipmentBuffer = await this.ctx.stub.getState(shipmentComshipmentsiteKey);
		return Shipment.fromBuffer(shipmentBuffer);
	}



	/**
	 * Adds a shipment model to the blockchain
	 * @param shipmentObject {Shipment}
	 * @returns {Promise<void>}
	 */
	async addShipment(shipmentObject) {

		let shipmentComshipmentsiteKey = this.ctx.stub.createCompositeKey(this.name, shipmentObject.getKeyArray());
		let shipmentBuffer = shipmentObject.toBuffer();
		await this.ctx.stub.putState(shipmentComshipmentsiteKey, shipmentBuffer);
		


	}


	/**
	 * Updates a shipment model on the blockchain
	 * @param shipmentObject {Shipment}
	 * @returns {Promise<void>}
	 */
	async updateShipment(shipmentObject) {
		let shipmentComshipmentsiteKey = this.ctx.stub.createCompositeKey(this.name, shipmentObject.getKeyArray());
		let shipmentBuffer = shipmentObject.toBuffer();
		await this.ctx.stub.putState(shipmentComshipmentsiteKey, shipmentBuffer);
	}
}

module.exports = ShipmentList;