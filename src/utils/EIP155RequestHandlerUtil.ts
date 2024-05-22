import { EIP155_SIGNING_METHODS } from '@/data/EIP155Data'
import { eip155Wallets } from '@/utils/EIP155WalletUtil';
import {
  getSignParamsMessage,
  getSignTypedDataParamsData,
  getWalletAddressFromParams
} from '@/utils/HelperUtil'
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import SettingsStore from '@/store/SettingsStore'
type RequestEventArgs = Omit<SignClientTypes.EventArguments['session_request'], 'verifyContext'>

export async function approveEIP155Request(requestEvent: any, feeData?: any) {
  const { params, id } = requestEvent
  const { chainId, request } = params

  console.log(requestEvent, chainId, "tests")

  SettingsStore.setActiveChainId(chainId)
  if(!eip155Wallets) {
    alert("Failed to init keepkey! restart app")
    throw Error("Failed to init keepkey! restart app")
  }
  // const wallet = await getWallet(params)
  console.log("METHOD: ",request.method)
  switch (request.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      try {

        let wallets = Object.keys(eip155Wallets)
        const message = getSignParamsMessage(request.params)
        const signedMessage = await eip155Wallets[wallets[0]].signMessage(message)
        console.log("signedMessage: ",signedMessage)
        return formatJsonRpcResult(id, signedMessage)

      } catch (error: any) {
        console.error(error)
        alert(error.message)
        return formatJsonRpcError(id, error.message)
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      try {

        let wallets = Object.keys(eip155Wallets)
        const { domain, types, message, primaryType } = getSignTypedDataParamsData(request.params)
        console.log("typeddata: ",{ domain, types, message, primaryType })
        // delete types.EIP712Domain
        let signedData = await eip155Wallets[wallets[0]].signTypedData({domain, types, message, primaryType})
        return formatJsonRpcResult(id, signedData)

      } catch (error: any) {
        console.error(error)
        alert(error.message)
        return formatJsonRpcError(id, error.message)
      }

    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      try {

        const sendTransaction = request.params[0]
        let chainidNum = parseInt(chainId.split(":")[1])
        console.log("chainidNum: ",chainidNum)
        sendTransaction.networkId = chainId
        sendTransaction.chainId = chainidNum
        let wallets = Object.keys(eip155Wallets)
        let signedTx = await eip155Wallets[wallets[0]].signTransaction(sendTransaction)

       try{
          let receipt = await eip155Wallets[wallets[0]].broadcastTransaction(signedTx, sendTransaction.networkId)
          console.log("receipt: ",receipt)
          return formatJsonRpcResult(id, receipt)
        }catch(e: any){
          alert("failed to broadcast! e: "+e.message)
        }

      } catch (error: any) {
        console.error(error)
        alert(error.message)
        return formatJsonRpcError(id, error.message)
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      try {

        const signTransaction = request.params[0]
        let wallets = Object.keys(eip155Wallets)
        let signedTx = await eip155Wallets[wallets[0]].signTransaction(signTransaction)

        return formatJsonRpcResult(id, signedTx)
      } catch (error: any) {
        console.error(error)
        alert(error.message)
        return formatJsonRpcError(id, error.message)
      }

    default:
      throw new Error(getSdkError('INVALID_METHOD').message)
  }
}

export function rejectEIP155Request(request: RequestEventArgs) {
  const { id } = request

  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message)
}
