'use strict';

const { Contract, Context } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;
const Company = require('./lib/models/company.js');
const companyList = require('./lib/lists/companylist.js');
const Drug = require('./lib/models/drug.js');
const drugList = require('./lib/lists/druglist.js');
const Po = require('./lib/models/po.js');
const poList = require('./lib/lists/polist.js');
const Shipment = require('./lib/models/shipment.js');
const shipmentList = require('./lib/lists/shipmentlist.js');



class ShipmentContext extends Context {
    constructor() {
        super();
        // Add various model lists to the context class object
        // this : the context instance
        this.companyList = new companyList(this);
        this.drugList = new drugList(this);
        this.poList = new poList(this);
        this.shipmentList = new shipmentList(this);


    }
}

class ShipmentContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.pharma-network.pharmanet.shipment');
    }

    // Built in method used to build and return the context for this smart contract on every transaction invoke
    createContext() {
        return new ShipmentContext();
    }

    /* ****** All custom functions are defined below ***** */

    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Shipment Smart Contract Instantiated');
    }

    /**
    * Create a new  Purchase Order on the ledger on the network
    * @param ctx - The transaction context object
    * @param buyerCRN - CRN of Buyer
    * @param sellerCRN - CRN of Seller
    * @param drugName - Name of the drug
    * @param quantity - quantity  of the Drug
    * @returns newPOObject {Object}
    */
    async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
        // Verify the Client either distributor or retailer
        let cid = new ClientIdentity(ctx.stub);
        let mspID = cid.getMSPID();
        if (mspID !== "distributorMSP" && mspID !== "retailerMSP") {
            throw new Error('You are not authorized to invoke this fuction');
        }

        const buyerKey = Company.makeKey([buyerCRN]);
        const sellerKey = Company.makeKey([sellerCRN]);
        const drugKey = Drug.makeKey([drugName]);
        let buyer = await ctx.companyList
            .getCompanyFromCRN(buyerKey)
            .catch(err => console.log('Provided   buyerCRM is invalid!'));
        let seller = await ctx.companyList
            .getCompanyFromCRN(sellerKey)
            .catch(err => console.log('Provided   sellerCRM is invalid!'));
        let drug = await ctx.drugList
            .getDrugFromName(drugKey)
            .catch(err => console.log('Provided   drug Name is invalid!'));
        // Make sure buyer  already exists.
        if (buyer === undefined) {
            throw new Error('Invalid CRM : ' + buyerCRN + '. No Buyer with this CRM  exists.');
        }
        // Make sure seller  already exists.
        if (seller === undefined) {
            throw new Error('Invalid CRM : ' + sellerCRN + '. No Seller with this CRM  exists.');
        }
        // Make sure Drug  already exists.
        if (drug === undefined) {
            throw new Error('Invalid Drug Name : ' + drugName + '. No Drug with this Name  exists.');
        }
        let buyerHierarchyKey = buyer.hierarchyKey;
        let sellerHierarchyKey = seller.hierarchyKey;
        let hierarchyKeyDiff = buyerHierarchyKey - sellerHierarchyKey;
        if (hierarchyKeyDiff !== 1) {
            throw new Error('Invalid Hierarchy : ');
        }

        // Create a new composite key for the PO
        const poKey = Po.makeKey([buyerCRN, drugName]);

        // Fetch Po with given buyerCRN and drugName from blockchain
        let existingPo = await ctx.poList
            .getPo(poKey)
            .catch(err => console.log('Provided  buyer and drug is unique!'));

        // Make sure Po does not already exist.
        if (existingPo !== undefined) {
            throw new Error('Invalid buyer : ' + buyerCRN + '. A Po with this buyerCRN and drugName already exists.');
        }

        // Create a Po object to be stored in blockchain
        let poObject = {
            poID: poKey,
            drugName: drugName,
            quantity: quantity,
            buyer: buyer.companyID,
            seller: seller.companyID,
            createdAt: new Date(),
            updatedAt: new Date(),
        };



        // Create a new instance of Po model and save it to blockchain
        let newPoObject = Po.createInstance(poObject);
        await ctx.poList.addPo(newPoObject);
        // Return value of new Po Object
        return newPoObject;

    }

    /**
  * Create a new  Shipment on the ledger on the network
  * @param ctx - The transaction context object
  * @param buyerCRN - CRN of Buyer
  * @param drugName - Name of the drug
  * @param listOfAssets - list Of Assets  of the Drug
  * @param transporterCRN - CRN of transporter
  * @returns newShipmentObject {Object}
  */
    async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN) {
        // Verify the Client either manufacturer or distributor 
        let cid = new ClientIdentity(ctx.stub);
        let mspID = cid.getMSPID();
        if (mspID !== "manufacturerMSP" && mspID !== "distributorMSP") {
            throw new Error('You are not authorized to invoke this fuction');
        }

        // Create a new composite key for the PO
        const poKey = Po.makeKey([buyerCRN, drugName]);

        // Fetch Po with given buyerCRN and drugName from blockchain
        let existingPo = await ctx.poList
            .getPo(poKey)
            .catch(err => console.log('Provided  buyer and drug is unique!'));

        // Make sure Po does not already exist.
        if (existingPo === undefined) {
            throw new Error('Invalid PO : ' + poKey);
        }

        const transporterKey = Company.makeKey([transporterCRN]);
        let transporter = await ctx.companyList
            .getCompanyFromCRN(transporterKey)
            .catch(err => console.log('Provided   CRM is invalid!'));
        // Make sure transporter  already exists.
        if (transporter === undefined) {
            throw new Error('Invalid CRM : ' + transporterCRN + '. No transporter with this CRM  exists.');
        }

        const shipmentKey = Shipment.makeKey([buyerCRN, drugName]);
        let listOfAssetsArr = listOfAssets.split(",");
        if (existingPo.quantity != listOfAssetsArr.length) {
            throw new Error('Invalid asset List. The quantity of PO doesnot matches ');
        }
        let assetsList = [];
        for (let i = 0; i < listOfAssetsArr.length; i++) {
            let serialNo = listOfAssetsArr[i];
            let drugKey = Drug.makeKey([drugName, serialNo]);
           
            let existingDrug = await ctx.drugList
                .getDrug(drugKey)
                .catch(err => console.log('invalid Drug Serial No!'));

            // Make sure Drug already exists.
            if (existingDrug !== undefined) {
                existingDrug.owner = transporter.companyID;
                existingDrug.updatedAt = new Date();
                assetsList.push(existingDrug.productID);
                // Create a new instance of Drug model and save it to blockchain
                let newDrugObject = Drug.createInstance(existingDrug);
                await ctx.drugList.updateDrug(newDrugObject);


            } else {
                throw new Error('Invalid drugKey : ' + drugKey);
            }

        }


        // Create a Shipment object to be stored in blockchain
        let shipmentObject = {
            shipmentID: shipmentKey,
            creator: poKey.seller,
            assets: assetsList,
            transporter: transporter.companyID,
            status: "in-transit",
            createdAt: new Date(),
            updatedAt: new Date(),
        };



        // Create a new instance of Shipment model and save it to blockchain
        let newShipmentObject = Shipment.createInstance(shipmentObject);
        await ctx.shipmentList.addShipment(newShipmentObject);
        // Return value of new Shipment Object
        return newShipmentObject;



    }


}



module.exports = ShipmentContract;