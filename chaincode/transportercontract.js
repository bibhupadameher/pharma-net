'use strict';

const { Contract, Context } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;
const Company = require('./lib/models/company.js');
const companyList = require('./lib/lists/companylist.js');
const Drug = require('./lib/models/drug.js');
const drugList = require('./lib/lists/druglist.js');
const Shipment = require('./lib/models/shipment.js');
const shipmentList = require('./lib/lists/shipmentlist.js');


class TransportContext extends Context {
    constructor() {
        super();
        // Add various model lists to the context class object
        // this : the context instance
        this.companyList = new companyList(this);
        this.drugList = new drugList(this);
        this.shipmentList = new shipmentList(this);


    }
}

class TransportContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.pharma-network.pharmanet.transport');
    }

    // Built in method used to build and return the context for this smart contract on every transaction invoke
    createContext() {
        return new TransportContext();
    }

    /* ****** All custom functions are defined below ***** */

    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Transport Smart Contract Instantiated');
    }
    /**
        * update shipment on the ledger on the network
        * @param ctx - The transaction context object
        * @param buyerCRN - CRN of buyer
        * @param drugName - Name of the drug
        * @param transporterCRN - CRN of Traspoter
        * @returns ShipmentObject {Object}
        */
    async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {
        // Verify the Client is  a transporter
        let cid = new ClientIdentity(ctx.stub);
        let mspID = cid.getMSPID();
        if (mspID !== "transporterMSP") {
            throw new Error('You are not authorized to invoke this fuction');
        }

        // Create a new composite key for the Shipment
        const shipmentKey = Shipment.makeKey([buyerCRN, drugName]);

        // Fetch shipment with given buyerCRN and drugName from blockchain
        let existingShipment = await ctx.shipmentList
            .getShipment(shipmentKey)
            .catch(err => console.log('Provided  buyer and drug is not valid!'));

        // Make sure Shipment  already exist.
        if (existingShipment === undefined) {
            throw new Error('Invalid Shipment : ' + shipmentKey);
        }
        const transporterKey = Company.makeKey([transporterCRN]);
        let transporter = await ctx.companyList
            .getCompanyFromCRN(transporterKey)
            .catch(err => console.log('Provided   transporter CRM is invalid!'));
        // Make sure transporter  already exists.
        if (transporter === undefined) {
            throw new Error('Invalid CRM : ' + transporterCRN + '. No transporter with this CRM  exists.');
        }
        if (existingShipment.transporter !== transporter.companyID) {
            throw new Error('Invalid CRM : ' + transporterCRN + '. Not Authorised to invoke this function');
        }
        const buyerKey = Company.makeKey([buyerCRN]);
        let buyer = await ctx.companyList
            .getCompanyFromCRN(buyerKey)
            .catch(err => console.log('Provided   CRM is invalid!'));
        // Make sure buyer  already exists.
        if (buyer === undefined) {
            throw new Error('Invalid CRM : ' + buyerCRN + '. No buyer with this CRM  exists.');
        }

        let listOfAssetsArr = existingShipment.assets;
        for (let i = 0; i < listOfAssetsArr.length; i++) {
            let drugKey = listOfAssetsArr[i].replace('org.pharma-network.pharmanet.models.drug:','');;
            let existingDrug = await ctx.drugList
                .getDrug(drugKey)
                .catch(err => console.log('invalid Drug Serial No!'));

            // Make sure Drug  already exist.
            if (existingDrug !== undefined) {
                existingDrug.owner = buyer.companyID;
                let updatedshipment = existingDrug.shipment;
                updatedshipment.push(existingShipment.shipmentID);
                existingDrug.shipment = updatedshipment;
                existingDrug.updatedAt = new Date();
                // Create a new instance of Drug model and save it to blockchain
                let newDrugObject = Drug.createInstance(existingDrug);
                await ctx.drugList.updateDrug(newDrugObject);


            } else {
                throw new Error('Invalid drugKey : ' + drugKey);
            }

        }

        existingShipment.status = "delivered";
        existingShipment.updatedAt = new Date();

        // Create a new instance of Shipment model and save it to blockchain
        let newShipmentObject = Shipment.createInstance(existingShipment);
        await ctx.shipmentList.updateShipment(newShipmentObject);
        // Return value of new Shipment Object
        return newShipmentObject;

    }



}



module.exports = TransportContract;