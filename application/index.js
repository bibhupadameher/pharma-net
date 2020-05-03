const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

const addToWallet = require('./1_addToWallet');
const registerCompany = require('./2_registerCompany');
const addDrug = require('./3_addDrug');
const createPO = require('./4_createPO');
const createShipment = require('./5_createShipment');
const updateShipment = require('./6_updateShipment');
const retailDrug = require('./7_retailDrug');
const viewHistory = require('./8_viewHistory');
const viewDrugCurrentState = require('./9_viewDrugCurrentState');




app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('title', 'Pharma App');


app.get('/', (req, res) => res.send('Hello Pharma'));




addToWallet.execute().then(() => {
    console.log('user credentials added to wallet');

})
    .catch((e) => {
        console.log('Failed to add to wallet');
    });






app.post('/registerCompany', (req, res) => {
    registerCompany.execute("manufacturer", req.body.companyCRN, req.body.companyName, req.body.Location, req.body.organisationRole).then((company) => {

        console.log('registering Company is successfull');
        const result = {
            status: 'success',
            message: 'New Company registered',
            company: company
        };
        res.json(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed to register Company ',
                error: e
            }
            res.status(500).send(result);
        });

});

app.post('/addDrug', (req, res) => {
    addDrug.execute("manufacturer", req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate, req.body.companyCRN).then((drug) => {

        console.log('Adding new drug is successfull');
        const result = {
            status: 'success',
            message: 'New drug is added',
            drug: drug
        };
        res.json(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed to add drug ',
                error: e
            }
            res.status(500).send(result);
        });

});


app.post('/createPO', (req, res) => {
    createPO.execute("distributor", req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity).then((PO) => {

        console.log('creating PO is successfull');
        const result = {
            status: 'success',
            message: 'New PO is created',
            PO: PO
        };
        res.json(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed to create PO ',
                error: e
            }
            res.status(500).send(result);
        });

});



app.post('/createShipment', (req, res) => {
    createShipment.execute("distributor", req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN).then((shipment) => {

        console.log('creating Shipment is successfull');
        const result = {
            status: 'success',
            message: 'New Shipment is created',
            shipment: shipment
        };
        res.json(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed to create Shipment ',
                error: e
            }
            res.status(500).send(result);
        });

});

app.post('/updateShipment', (req, res) => {
    updateShipment.execute("transporter", req.body.buyerCRN, req.body.drugName, req.body.transporterCRN).then((shipment) => {

        console.log('updating Shipment is successfull');
        const result = {
            status: 'success',
            message: ' Shipment is updated',
            shipment: shipment
        };
        res.json(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed to update Shipment ',
                error: e
            }
            res.status(500).send(result);
        });

});

app.post('/retailDrug', (req, res) => {
    retailDrug.execute("retailer", req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar).then((drug) => {

        console.log('Drug sold by retailer is updated');
        const result = {
            status: 'success',
            message: ' Drug sold by retailer is updated',
            drug: drug
        };
        res.json(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed to update Drug sold by retailer  ',
                error: e
            }
            res.status(500).send(result);
        });

});

app.post('/viewHistory', (req, res) => {
    viewHistory.execute("retailer", req.body.drugName, req.body.serialNo).then((drug) => {

        console.log('Drug history is fetched');
        const result = {
            status: 'success',
            message: 'Drug history is fetched',
            drug: drug
        };
        res.json(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed to fetch Drug history',
                error: e
            }
            res.status(500).send(result);
        });

});

app.post('/viewDrugCurrentState', (req, res) => {
    viewDrugCurrentState.execute("retailer", req.body.drugName, req.body.serialNo).then((drug) => {

        console.log('Drug current state is fetched');
        const result = {
            status: 'success',
            message: 'Drug current state is fetched',
            drug: drug
        };
        res.json(result);
    })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed to fetch Drug current state',
                error: e
            }
            res.status(500).send(result);
        });

});
app.listen(port, () => console.log("Pharma Client app is running"));