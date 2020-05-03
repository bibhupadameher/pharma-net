'use strict';

const { Contract, Context } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;
const Company = require('./lib/models/company.js');
const companyList = require('./lib/lists/companylist.js');
const Drug = require('./lib/models/drug.js');
const drugList = require('./lib/lists/druglist.js');


class RetailerContext extends Context {
    constructor() {
        super();
        // Add various model lists to the context class object
        // this : the context instance
        this.companyList = new companyList(this);
        this.drugList = new drugList(this);


    }
}

class RetailerContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.pharma-network.pharmanet.retailer');
    }

    // Built in method used to build and return the context for this smart contract on every transaction invoke
    createContext() {
        return new RetailerContext();
    }

    /* ****** All custom functions are defined below ***** */

    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Retailer Smart Contract Instantiated');
    }
    /**
   * Drug sell to customer by Retailer on the ledger on the network
   * @param ctx - The transaction context object
   * @param drugName - Name of the drug
   * @param serialNo - serial No of the drug
   * @param retailerCRN - CRN of retailer
   * @param customerAadhar - Aadhar number of customer
   * @returns DrugObject {Object}
   */
    async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
        // Verify the Client is  a retailer
        let cid = new ClientIdentity(ctx.stub);
        let mspID = cid.getMSPID();
        if (mspID !== "retailerMSP") {
            throw new Error('You are not authorized to invoke this fuction');
        }
        // Create a new composite key for the new Drug
        const drugKey = Drug.makeKey([drugName, serialNo]);

        // Fetch Drug with given name and serialNo from blockchain
        let existingDrug = await ctx.drugList
            .getDrug(drugKey)
            .catch(err => console.log('Provided  name and serialNo is invalid!'));

        // Make sure Drug  already exist.
        if (existingDrug === undefined) {
            throw new Error('Invalid serialNo : ' + serialNo + '. A Drug with this serialNo does not already exists.');
        }
        const retailerKey = Company.makeKey([retailerCRN]);
        let retailer = await ctx.companyList
            .getCompanyFromCRN(retailerKey)
            .catch(err => console.log('Provided   CRM is invalid!'));
        // Make sure retailer  already exists.
        if (retailer === undefined) {
            throw new Error('Invalid CRM : ' + retailerCRN + '. No retailer with this CRM  exists.');
        }
        else if (retailer.companyID !== existingDrug.owner) {
            throw new Error('Invalid CRM : ' + retailerCRN + '. This Retailer is not the owner of the drug');
        }
        existingDrug.owner = customerAadhar;
        existingDrug.updatedAt = new Date();
        // Create a new instance of Drug model and save it to blockchain
        let newDrugObject = Drug.createInstance(existingDrug);
        await ctx.drugList.updateDrug(newDrugObject);
        return newDrugObject;


    }


}



module.exports = RetailerContract;