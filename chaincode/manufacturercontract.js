'use strict';

const { Contract, Context } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;
const Company = require('./lib/models/company.js');
const companyList = require('./lib/lists/companylist.js');
const Drug = require('./lib/models/drug.js');
const drugList = require('./lib/lists/druglist.js');


class ManufacturerContext extends Context {
    constructor() {
        super();
        // Add various model lists to the context class object
        // this : the context instance
        this.companyList = new companyList(this);
        this.drugList = new drugList(this);


    }
}

class ManufacturerContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.pharma-network.pharmanet.manufacturer');
    }

    // Built in method used to build and return the context for this smart contract on every transaction invoke
    createContext() {
        return new ManufacturerContext();
    }

    /* ****** All custom functions are defined below ***** */

    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Manufacturer Smart Contract Instantiated');
    }

    /**
 * Create a new  drug on the ledger on the network
 * @param ctx - The transaction context object
 * @param drugName - Name of the Drug
 * @param serialNo - serial No of the Drug
 * @param mfgDate - manufacturing Date  of the Drug
 * @param expDate - expiry Date  of the Drug
 * @param companyCRN - Company Registration Number
 * @returns newDrugObject {Object}
 */
    async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {

        // Verify the Client is  an Manufacturer
        let cid = new ClientIdentity(ctx.stub);
        let mspID = cid.getMSPID();
        if (mspID !== "manufacturerMSP") {
            throw new Error('You are not authorized to invoke this fuction');
        }

        // Create a new composite key for the new Drug
        const drugKey = Drug.makeKey([drugName, serialNo]);

        // Fetch Drug with given name and serialNo from blockchain
        let existingDrug = await ctx.drugList
            .getDrug(drugKey)
            .catch(err => console.log('Provided  name and serialNo is unique!'));

        // Make sure Drug does not already exist.
        if (existingDrug !== undefined) {
            throw new Error('Invalid serialNo : ' + serialNo + '. A Drug with this serialNo already exists.');
        }


        const manufacturerKey = Company.makeKey([companyCRN]);
        let manufacturer = await ctx.companyList
            .getCompanyFromCRN(manufacturerKey)
            .catch(err => console.log('Provided   CRM is invalid!'));

        // Make sure manufacturer  already exists.
        if (manufacturer === undefined) {
            throw new Error('Invalid CRM : ' + companyCRN + '. No Company with this CRM  exists.');
        }
        // Make sure company is a manufacturer.
        if (manufacturer.hierarchyKey !== 1) {
            throw new Error('Invalid CRM : ' + companyCRN + '. This is not a manufacturing company.');
        }
        // Create a Drug object to be stored in blockchain
        let drugObject = {
            productID: drugKey,
            name: drugName,
            manufacturer: manufacturer.companyID,
            manufacturingDate: mfgDate,
            expiryDate: expDate,
            owner: manufacturer.companyID,
            shipment: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };



        // Create a new instance of Drug model and save it to blockchain
        let newDrugObject = Drug.createInstance(drugObject);
        await ctx.drugList.addDrug(newDrugObject);
        // Return value of new Drug Object
        return newDrugObject;



    }
}



module.exports = ManufacturerContract;