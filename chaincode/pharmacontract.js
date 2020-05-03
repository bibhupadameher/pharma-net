'use strict';

const { Contract, Context } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;
const Company = require('./lib/models/company.js');
const companyList = require('./lib/lists/companylist.js');
const Drug = require('./lib/models/drug.js');
const drugList = require('./lib/lists/druglist.js');
const shipmentList = require('./lib/lists/shipmentlist.js');


class PharmaContext extends Context {
    constructor() {
        super();
        // Add various model lists to the context class object
        // this : the context instance
        this.companyList = new companyList(this);
        this.drugList = new drugList(this);
        this.shipmentList = new shipmentList(this);


    }
}

class PharmaContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.pharma-network.pharmanet.all');
    }

    // Built in method used to build and return the context for this smart contract on every transaction invoke
    createContext() {
        return new PharmaContext();
    }

    /* ****** All custom functions are defined below ***** */

    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Pharma Smart Contract Instantiated');
    }

	/**
	 * Create a new  Company on the ledger on the network
	 * @param ctx - The transaction context object
	 * @param companyCRN - Company Registration Number
	 * @param companyName - Name of the Company
	 * @param location - Location Of the Company
	 * @param organisationRole - Role of the Company
	 * @returns newCompanyObject {Object}
	 */
    async registerCompany(ctx, companyCRN, companyName, location, organisationRole) {

        // Verify the Client is not an Consumer
        let cid = new ClientIdentity(ctx.stub);
        let mspID = cid.getMSPID();
        if (mspID === "consumerMSP") {
            throw new Error('You are not authorized to invoke this fuction');
        }

        // Create a new composite key for the new Company
        const companyKey = Company.makeKey([companyCRN, companyName]);

        // Fetch Company with given name and CRM from blockchain
        let existingCompany = await ctx.companyList
            .getCompany(companyKey)
            .catch(err => console.log('Provided   CRM is unique!'));

        // Make sure Company does not already exist.
        if (existingCompany !== undefined) {
            throw new Error('Invalid CRM : ' + companyCRN + '. A Company with this CRM already exists.');
        } else {
            // Create a Company object to be stored in blockchain
            let companyObject = null;
            if (organisationRole === 'Transporter') {
                companyObject = {
                    companyID: companyKey,
                    name: companyName,
                    location: location,
                    organisationRole: organisationRole,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            } else {
                let hierarchyKey = null;
                if (organisationRole === 'Manufacturer') {
                    hierarchyKey = 1;
                } else if (organisationRole === 'Distributor') {
                    hierarchyKey = 2;
                } else if (organisationRole === 'Retailer') {
                    hierarchyKey = 3;
                } else {
                    throw new Error('Invalid organisation Role');
                }

                companyObject = {
                    companyID: companyKey,
                    name: companyName,
                    location: location,
                    organisationRole: organisationRole,
                    hierarchyKey: hierarchyKey,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }

            // Create a new instance of Company model and save it to blockchain
            let newCompanyObject = Company.createInstance(companyObject);
            await ctx.companyList.addCompany(newCompanyObject);
            // Return value of new Company Object
            return newCompanyObject;
        }


    }

    /**
     * view History of Drug on the ledger on the network
     * @param ctx - The transaction context object
     * @param drugName - Name of the drug
     * @param serialNo - serialNo  of the Drug
     * @returns DrugObject {Object}
     */
    async viewHistory(ctx, drugName, serialNo) {
        let drugKey = Drug.makeKey([drugName, serialNo]);
        let existingDrug = await ctx.drugList
            .getDrug(drugKey)
            .catch(err => console.log('invalid Drug Serial No!'));

        // Make sure Drug does not already exist.
        if (existingDrug !== undefined) {
            let shipmentList = existingDrug.shipment;
            for (let i = 0; i < shipmentList.length; i++) {
                let shipmentKey = shipmentList[i].replace('org.pharma-network.pharmanet.models.shipment:', '');
                // Fetch shipment with given shipmentKey from blockchain
                let existingShipment = await ctx.shipmentList
                    .getShipment(shipmentKey)
                    .catch(err => console.log('Provided  buyer and drug is not valid!'));

                // Make sure Shipment  already exist.
                if (existingShipment === undefined) {
                    throw new Error('Invalid Shipment : ' + shipmentKey);
                }
                if (i === 0)
                    existingDrug.shipmentID_1 = existingShipment;
                else
                    existingDrug.shipmentID_2 = existingShipment;
            }

            return existingDrug;
        } else {
            throw new Error('Invalid drugKey : ' + drugKey);
        }
    }
    /**
     * view DrugCurrentState (drugName, serialNo) on the ledger on the network
     * buyerCRN, drugName, listOfAssets, transporterCRN
     * @param ctx - The transaction context object
     * @param drugName - Name of the drug
     * @param serialNo - serialNo  of the Drug
     * @returns DrugObject {Object}
     */
    async viewDrugCurrentState(ctx, drugName, serialNo) {
        let drugKey = Drug.makeKey([drugName, serialNo]);
        let existingDrug = await ctx.drugList
            .getDrug(drugKey)
            .catch(err => console.log('invalid Drug Serial No!'));

        // Make sure Drug does not already exist.
        if (existingDrug !== undefined) {


            return existingDrug;
        } else {
            throw new Error('Invalid drugKey : ' + drugKey);
        }
    }


}



module.exports = PharmaContract;