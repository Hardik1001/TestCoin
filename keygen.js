const EC = require('elliptic').ec; //this lib allows to generate pub pvt key pairs and also has methods to sign, and verify signatures
const ec = new EC('secp256k1'); //argument is the elliptic curve or encryption algo u want to use

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex'); //hex string
const privateKey = key.getPrivate('hex');

console.log();
console.log("Private key: ", privateKey );

console.log();
console.log("Public key: ", publicKey );