import { useCallback, useState } from 'react'
import { Divider, Text } from '@nextui-org/react'

import RequestDataCard from '@/components/RequestDataCard'
import RequestFeeCard from '@/components/RequestFeeCard'
import RequesDetailsCard from '@/components/RequestDetalilsCard'
import RequestMethodCard from '@/components/RequestMethodCard'
import ModalStore from '@/store/ModalStore'
import { approveEIP155Request, rejectEIP155Request } from '@/utils/EIP155RequestHandlerUtil'
import { styledToast } from '@/utils/HelperUtil'
import { web3wallet } from '@/utils/WalletConnectUtil'
import RequestModal from './RequestModal'
import useKeepKey from '@/hooks/useKeepKey'

export default function SessionSendTransactionModal() {
  const [isLoadingApprove, setIsLoadingApprove] = useState(false)
  const [isLoadingReject, setIsLoadingReject] = useState(false)
  const [feeData, setFeeData] = useState(false)

  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent
  const requestSession = ModalStore.state.data?.requestSession

  const topic = requestEvent?.topic
  const params = requestEvent?.params
  const chainId = params?.chainId
  const request = params?.request
  const [transaction, setTransaction] = useState(request?.params[0])
  // Use the custom hook to get the KeepKey client
  const keepKey = useKeepKey();

  // Handle approve action
  const onApprove = useCallback(async () => {
    if (requestEvent && topic) {
      setIsLoadingApprove(true)
      try {
        console.log("requestEvent: ", requestEvent)
        const response = await approveEIP155Request(requestEvent, feeData)
        await web3wallet.respondSessionRequest({
          topic,
          response
        })
      } catch (e) {
        setIsLoadingApprove(false)
        styledToast((e as Error).message, 'error')
        return
      }
      setIsLoadingApprove(false)
      ModalStore.close()
    }
  }, [requestEvent, topic])

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent && topic) {
      setIsLoadingReject(true)
      const response = rejectEIP155Request(requestEvent)
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response
        })
      } catch (e) {
        setIsLoadingReject(false)
        styledToast((e as Error).message, 'error')
        return
      }
      setIsLoadingReject(false)
      ModalStore.close()
    }
  }, [requestEvent, topic, keepKey])

  const updateFeeData = function(feeData:any, isEIP1559:boolean){
    console.log("updateFeeData: ", feeData)
    setFeeData(feeData)
    console.log('transaction: ', transaction)
    if(!isEIP1559){
      transaction.gasPrice = feeData.gasPrice
      transaction.maxFeePerGas = null
      transaction.maxPriorityFeePerGas = null
    }else{
      transaction.gasPrice = null
      transaction.maxFeePerGas = feeData.maxFeePerGas
      transaction.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
    }
    setTransaction(transaction)
    console.log('transaction: ', transaction)
  }

  return request && requestSession ? (
    <RequestModal
      intention="sign a transaction"
      metadata={requestSession?.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
      approveLoader={{ active: isLoadingApprove }}
      rejectLoader={{ active: isLoadingReject }}
    >
      <RequestFeeCard data={transaction} updateFeeData={updateFeeData} chainId={chainId}/>
      <Divider y={1} />
      <RequestDataCard data={transaction} />
      <Divider y={1} />
      <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession?.relay.protocol} />
      <Divider y={1} />
      <RequestMethodCard methods={[request.method]} />
    </RequestModal>
  ) : (
    <Text>Request not found</Text>
  )
}
