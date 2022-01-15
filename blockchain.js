const { error } = require('console');
const SHA256 = require('crypto-js/sha256');

const EC = require('elliptic').ec; //this lib allows to generate pub pvt key pairs and also has methods to sign, and verify signatures
const ec = new EC('secp256k1'); //argument is the elliptic curve or encryption algo u want to use

var index = 0;

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress=fromAddress;
        this.toAddress=toAddress;
        this.amount=amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString(); //we r goin to sign the trx hash not the individual trx args
    }

    signTrn(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transaction for other wallets!');
        }

        const hashTn = this.calculateHash();
        const sig = signingKey.sign(hashTn, 'base64');
        this.signature = sig.toDER('hex'); //format conversion of sig and then storing it in signature
    }

    isValid(){
        if(this.fromAddress === null) return true; //case of mining reward

        if(!this.signature || this.signature.length === 0){ // no signature or signature length 0
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature); //verify hash of this trn has been singed by this signature 
    }
}

class Block{
    constructor(transactions, previousHash=""){
        const now = new Date();
        this.blockNumber=index;
        this.timestamp=now; //now.getTime() gives unix epoch time in ms.
        this.transactions=transactions; //array of transaction
        this.previousHash=previousHash;
        this.hash=this.calculateHash();
        this.nonce=0;
        index++;
    }

    calculateHash(){
        return SHA256(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash=this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }

    hasValidTrx(){
        for(const trn of this.transactions){
            if(!trn.isValid()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain{
    constructor(){
        this.chain=[this.createGenesis()]; //array of blocks,not linked list coz it's difficult to delete elements and also add elements anywhere.
        this.difficulty=2;
        this.pendingTrx=[];
        this.miningReward=100;
    }

    createGenesis(){
        return new Block("Genesis block","0000");
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    minePendingTrx(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTrx.push(rewardTx);

        let newBlock = new Block(this.pendingTrx);
        newBlock.mineBlock(this.difficulty);
        console.log("Block mined successfully");
        newBlock.previousHash=this.chain[this.chain.length-1].hash;
        this.chain.push(newBlock);

        this.pendingTrx=[];

        /*this.pendingTrx=[
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];*/
    }

    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error("Transaction must include to and from address");
        }

        if(!transaction.isValid()){
            throw new Error("Cannot add invalid transaction");
        }

        this.pendingTrx.push(transaction);
    }

    getBalance(address){
        let balance = 0;
        for(const block of this.chain){
            for(const trn of block.transactions){
                if(trn.fromAddress === address){
                    balance -= trn.amount;
                }

                if(trn.toAddress === address){
                    balance += trn.amount;
                }
            }
        }
        return balance;
    }

   /* addBlock(newBlock){
        newBlock.previousHash=this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }*/

    isChainValid(){
        for(let i=1; i<this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTrx()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;