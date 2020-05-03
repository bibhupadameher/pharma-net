'use strict';

class Shipment {
	
	/**
	 * Constructor function
	 * @param shipmentObject {Object}
	 */
	constructor(shipmentObject) {
		this.key =String(shipmentObject.shipmentID).replace('org.pharma-network.pharmanet.models.shipment:','');
		shipmentObject.shipmentID = Shipment.getClass()+':'+this.key;
		Object.assign(this, shipmentObject);
	}
	
	/**
	 * Get class of this model
	 * @returns {string}
	 */
	static getClass() {
		return 'org.pharma-network.pharmanet.models.shipment';
	}
	
	/**
	 * Convert the buffer stream received from blockchain into an object of this model
	 * @param buffer {Buffer}
	 */
	static fromBuffer(buffer) {
		let json = JSON.parse(buffer.toString());
		return new Shipment(json);
	}
	
	/**
	 * Convert the object of this model to a buffer stream
	 * @returns {Buffer}
	 */
	toBuffer() {
		return Buffer.from(JSON.stringify(this));
	}
	
	/**
	 * Create a key string joined from different key parts
	 * @param keyParts {Array}
	 * @returns {*}
	 */
	static makeKey(keyParts) {
		return keyParts.map(part => JSON.stringify(part)).join(":");
	}
	
	/**
	 * Create an array of key parts for this model instance
	 * @returns {Array}
	 */
	getKeyArray() {
		return this.key.split(":");
	}
	
	/**
	 * Create a new instance of this model
	 * @returns {Shipment}
	 * @param shipmentObject {Object}
	 */
	static createInstance(shipmentObject) {
		return new Shipment(shipmentObject);
	}
	
}

module.exports = Shipment;