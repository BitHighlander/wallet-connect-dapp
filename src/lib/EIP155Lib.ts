// import { providers, Wallet } from 'ethers'

/**
 * Types
 */
interface IInitArgs {
  mnemonic?: string
}

/**
 * Library
 */
export default class EIP155Lib {
  wallet: any

  constructor(wallet: any) {
    this.wallet = wallet
  }

  static init({ mnemonic }: IInitArgs) {
    // const wallet = mnemonic ? Wallet.fromMnemonic(mnemonic) : Wallet.createRandom()

    return {}
  }

  getMnemonic() {
    return ""
  }

  getPrivateKey() {
    return ""
  }

  getAddress() {
    return ""
  }

  signMessage(message: string) {
    return ""
  }

  _signTypedData(domain: any, types: any, data: any, _primaryType?: string) {
    return ""
  }

  connect(provider: any) {
    return {}
  }

  signTransaction(transaction: any) {
    return {}
  }
}
