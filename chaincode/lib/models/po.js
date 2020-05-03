'use strict';

class Po {
	
	/**
	 * Constructor function
	 * @param poObject {Object}
	 */
	constructor(poObject) {
		this.key =String(poObject.poID).replace('org.pharma-network.pharmanet.models.po:','');
		poObject.poID = Po.getClass()+':'+this.key;
		Object.assign(this, poObject);
	}
	
	/**
	 * Get class of this model
	 * @returns {string}
	 */
	static getClass() {
		return 'org.pharma-network.pharmanet.models.po';
	}
	
	/**
	 * Convert the buffer stream received from blockchain into an object of this model
	 * @param buffer {Buffer}
	 */
	static fromBuffer(buffer) {
		let json = JSON.parse(buffer.toString());
		return new Po(json);
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
	 * @returns {Po}
	 * @param poObject {Object}
	 */
	static createInstance(poObject) {
		return new Po(poObject);
	}
	
}

module.exports = Po;