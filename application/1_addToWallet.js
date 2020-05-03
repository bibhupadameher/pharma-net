'use strict';

/**
 * This is a Node.JS module to load a user's Identity to his wallet.
 * This Identity will be used to sign transactions initiated by this user.
 *
 */

const fs = require('fs'); // FileSystem Library
const { FileSystemWallet, X509WalletMixin } = require('fabric-network'); // Wallet Library provided by Fabric
const path = require('path'); // Support library to build filesystem paths in NodeJs

const crypto_materials = path.resolve(__dirname, '../network/crypto-config'); // Directory where all Network artifacts are stored

//update the below private key from cryptogen folder

const privateKey = {
	consumer: 'a42fe2991ec142158a4fadde149c053eee9c73c5c8dc6a9fee7dcd7d35a22ac6_sk',
	distributor: 'd93b6d10ea12e46b6c95a8737d857464c9c8546161b4e7eea575c06f8b51c9ba_sk',
	manufacturer: '6cffce97abd57f3ef3de0c0b2f10c08c245fa0c3707b32d84a7b8873b3ab2884_sk',
	retailer: '02467dc4f7f736b1db818728a4b931ed8f6cfed5035691ad46276bf238981f92_sk',
	transporter: '9fbd02dbe225b9a4f94ffeb40719dbb87ecddd5e2cbb8224edc50c52ca82a56d_sk',

};


async function main() {


	const orgList = Object.keys(privateKey);
	orgList.forEach(updateWallet);

}

async function updateWallet(organization) {
	const uppercaseOrganization=organization.toUpperCase();
	// A wallet is a filesystem path that stores a collection of Identities
	let wallet = new FileSystemWallet('./identity/'+organization);

	// Main try/catch block
	try {

		// Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
		let credentialPath = path.join(crypto_materials, '/peerOrganizations/'+organization+'.pharma-network.com/users/Admin@'+organization+'.pharma-network.com');
		let certificate = fs.readFileSync(path.join(credentialPath, '/msp/signcerts/Admin@'+organization+'.pharma-network.com-cert.pem')).toString();
		// IMPORTANT: Change the private key name to the key generated on your computer
		let privatekey = fs.readFileSync(path.join(credentialPath, '/msp/keystore/'+privateKey[organization])).toString();

		// Load credentials into wallet
		let identityLabel = uppercaseOrganization+'_ADMIN';
		let identity = X509WalletMixin.createIdentity(organization+'MSP', certificate, privatekey);

		await wallet.import(identityLabel, identity);

	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
	}

}

/*main().then(() => {
	console.log('Added New Client Identity for ALl User in  wallet.');
}).catch((e) => {
	console.log(e);
	console.log(e.stack);
	process.exit(-1);
});
*/
module.exports.execute =main;