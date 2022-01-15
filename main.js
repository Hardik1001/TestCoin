const {Blockchain, Transaction} = require('./blockchain');

const EC = require('elliptic').ec; //this lib allows to generate pub pvt key pairs and also has methods to sign, and verify signatures
const ec = new EC('secp256k1'); //argument is the elliptic curve or encryption algo u want to use

const myKey = ec.keyFromPrivate('dc070bc35a05c67f914f745450c78315b60502a2aac15c935cd6619efc9cfe83');
const myWalletAddress = myKey.getPublic('hex'); //generating public key or wallet address for the given private key

let testcoin = new Blockchain();

//TEST CODESSSSSSSSSSSSSS

const tx1 = new Transaction(myWalletAddress, "Receiver", 10); //creating trn
tx1.signTrn(myKey); //signing trn with the sender's pvt key to prove ownership
testcoin.addTransaction(tx1); //adding trn to the tescoin blockchain instance

console.log("\n Starting the miner......");
testcoin.minePendingTrx(myWalletAddress); //here we have chosen the miner to be the sender of this trn, so miner starts mining
console.log("\nBalance of miner is ",testcoin.getBalance(myWalletAddress));
console.log();
console.log("Displaying blockchain");
console.log(JSON.stringify(testcoin,null,4));