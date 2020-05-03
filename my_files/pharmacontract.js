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


class PharmaContext extends Context {
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

class PharmaContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.pharma-network.pharmanet');
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
            assetsList.push(drugKey);
            let existingDrug = await ctx.drugList
                .getDrug(drugKey)
                .catch(err => console.log('invalid Drug Serial No!'));

            // Make sure Drug already exists.
            if (existingDrug !== undefined) {
                existingDrug.owner = transporter.companyID;
                existingDrug.updatedAt = new Date();
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
            let drugKey = listOfAssetsArr[i];
            let existingDrug = await ctx.drugList
                .getDrug(drugKey)
                .catch(err => console.log('invalid Drug Serial No!'));

            // Make sure Drug  already exist.
            if (existingDrug !== undefined) {
                existingDrug.owner = buyer.companyID;
                let updatedshipment = existingDrug.shipment;
                updatedshipment.push(shipmentKey);
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
                let shipmentKey = shipmentList[i];
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