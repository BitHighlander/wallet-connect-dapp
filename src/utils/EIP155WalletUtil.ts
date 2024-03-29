/*
  EVM Keepkey Wallet Util

          -Highlander

  * * This file contains the implementation of the EIP155Lib class, which is a wrapper around KeepKey's functionalities.

 */
import { EIP155_CHAINS, TEIP155Chain } from '@/data/EIP155Data';

const TAG  = " | 155 WALLET kk | "
// Assuming KeepKey's functionalities are encapsulated in the provided methods
import { ChainToChainId } from '@coinmasters/types';
import { JsonRpcProvider } from 'ethers';

class EIP155Lib {
  wallet: any;
  constructor(wallet: any) {
    this.wallet = wallet.keepkey;
  }

  async getMnemonic() {
    // Implement if KeepKey allows extracting mnemonic, which is unlikely due to security reasons
    return "lol, no";
  }

  async getPrivateKey() {
    // This is also highly sensitive and usually not directly accessible
    return "lol, no";
  }

  async getAddress() {
    console.log("keepkey: ",this.wallet)
    console.log("this.wallet.ETH: ",this.wallet.ETH)
    console.log("this.wallet.ETH: ",this.wallet.ETH.wallet)
    console.log("this.wallet.ETH.wallet.address: ",this.wallet.ETH.wallet.address)
    // Use KeepKey's method to get the wallet address
    return this.wallet.ETH.wallet.address;
  }

  async signMessage(message: any) {
    try{
      console.log("signMessage: ", message)
      console.log("this.wallet.ETH.walletMethods: ",this.wallet.ETH.walletMethods)
      // Use KeepKey's method to sign a message
      let address = this.wallet.ETH.wallet.address
      const messageFormated = `0x${Buffer.from(
        Uint8Array.from(
          typeof message === 'string' ? new TextEncoder().encode(message) : message,
        ),
      ).toString('hex')}`
      return this.wallet.ETH.keepkeySdk.eth.ethSign({address,message:messageFormated});
    }catch(e){
      console.error(e)
    }
  }

  async signTransaction(transaction:any) {
    let tag = TAG + " | signTransaction | ";
    try {
      console.log(tag,"**** transaction: ", transaction);

      // Basic transaction validation
      if (!transaction.from) throw Error("invalid tx missing from");
      if (!transaction.to) throw Error("invalid tx missing to");
      if (!transaction.data) throw Error("invalid tx missing data");
      if (!transaction.chainId) throw Error("invalid tx missing chainId");

      // Get provider for the specified chainId
      let rpcUrl = EIP155_CHAINS[transaction.networkId as TEIP155Chain].rpc;
      const provider = new JsonRpcProvider(rpcUrl);

      let nonce = await provider.getTransactionCount(transaction.from, 'pending');
      transaction.nonce = `0x${nonce.toString(16)}`;

      // transaction.gas = '0x28b60'; // Correct as it was
      console.log("dapp gasPrice: ", parseInt(transaction.gas, 16));

      // transaction.maxFeePerGas = '0x1e076361'; // This should be the higher value
      // transaction.maxPriorityFeePerGas = '0x8d19f'; // This should be the lower value

      const feeData = await provider.getFeeData();
      // console.log("recommended gasPrice:: ", feeData?.gasPrice?.toString());

      console.log("feeData: ", feeData);
      transaction.gasPrice = `0x${BigInt(feeData.gasPrice || '0').toString(16)}`;
      // transaction.gasPrice = transaction.gas
      transaction.maxFeePerGas = `0x${BigInt(feeData.maxFeePerGas || '0').toString(16)}`;
      transaction.maxPriorityFeePerGas = `0x${BigInt(feeData.maxPriorityFeePerGas || '0').toString(16)}`;

      // transaction.gas = `0x${BigInt("300000").toString(16)}`;

      try{
        const estimatedGas = await provider.estimateGas({
          from: transaction.from,
          to: transaction.to,
          data: transaction.data
        });
        console.log("estimatedGas: ", estimatedGas);
        transaction.gas = `0x${estimatedGas.toString(16)}`;
      }catch(e){
        transaction.gas = `0x${BigInt("135120").toString(16)}`;
      }

      let input: any = {
        from: transaction.from,
        addressNList: [2147483692, 2147483708, 2147483648, 0, 0], // Placeholder for actual derivation path
        data: transaction.data,
        nonce: transaction.nonce,
        gasLimit: transaction.gas,
        gas: transaction.gas,
        value: transaction.value || '0x0', // Assuming the transaction value is 0
        to: transaction.to,
        chainId: `0x${transaction.chainId.toString(16)}`,
      };

      // input.maxFeePerGas = transaction.maxFeePerGas;
      // input.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas;

      // Add EIP-1559 fields if applicable
      if (transaction.chainId === 1) {
        input.maxFeePerGas = transaction.maxFeePerGas;
        input.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
      } else {
        // For non-EIP-1559 transactions
        input.gasPrice = transaction.gasPrice;
      }

      // Proceed with transaction signing
      console.log(`${tag} Final input: `, input);
      let output = await this.wallet.ETH.keepkeySdk.eth.ethSignTransaction(input);
      console.log(`${tag} Transaction output: `, output);

      //


      return output.serialized;
    } catch (e) {
      console.error(`${tag} Error: `, e);
      throw e; // Rethrowing for external handling
    }
  }

  //signTypedData
  async signTypedData(params:any) {
    let tag = TAG + " | signTypedData | ";
    try {
      console.log(tag,"**** params: ", params);
      let signedMessage = await this.wallet.ETH.keepkeySdk.eth.ethSignTypedData({
        address: this.wallet.ETH.wallet.address,
        addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
        typedData: params,
      })
      console.log(tag,"**** signedMessage: ", signedMessage);
      return signedMessage;
      // return output.serialized;
    } catch (e) {
      console.error(`${tag} Error: `, e);
      throw e; // Rethrowing for external handling
    }
  }


  //broadcast
  async broadcastTransaction(signedTx: string, networkId: string) {
    try{
      let rpcUrl = EIP155_CHAINS[networkId as TEIP155Chain].rpc
      console.log('rpcUrl: ',rpcUrl)
      const provider = new JsonRpcProvider(rpcUrl)
      console.log('provider:', provider);
      // Broadcasting the signed transaction
      const receipt = await provider.send('eth_sendRawTransaction', [signedTx]);
      console.log('Transaction receipt:', receipt);


      // // Optionally, wait for the transaction to be mined
      // const receipt = await txResponse.wait();
      // console.log('Transaction receipt:', receipt);

      return receipt;
    }catch(e){
      console.error(e)
    }
  }

  //more methods to be added as needed, typeData?
}

export let wallet1: EIP155Lib
// export let wallet2: EIP155Lib
export let eip155Wallets: Record<string, EIP155Lib>
export let eip155Addresses: string[]

export async function createOrRestoreEIP155Wallet(keepkey: any) {
  try {
    console.log("createOrRestoreEIP155Wallet keepkey: ", keepkey);
    const wallet = new EIP155Lib({ keepkey });
    wallet1 = wallet;

    // Assuming KeepKey can provide a list of addresses or a single address
    const address = await wallet.getAddress();
    console.log("address: ", address);

    eip155Wallets = {
      [address]: wallet,
    };
    eip155Addresses = Object.keys(eip155Wallets);

    return {
      eip155Wallets,
      eip155Addresses,
    };
  } catch (e) {
    // Handle any errors
    console.error("Failed to create or restore EIP155 wallet:", e);
    throw e; // It's generally a good practice to re-throw the error after logging it
  }
}
