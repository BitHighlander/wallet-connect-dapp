import { Text } from '@nextui-org/react'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import WalletConnectPage from './walletconnect'
import ModalStore from '@/store/ModalStore'
import { useSnapshot } from 'valtio'

export default function DeepLinkPairingPage() {
  const state = useSnapshot(ModalStore.state)
  const router = useRouter()
  const [loadingMessage, setLoadingMessage] = useState('Loading...')
  const [requestTimeout, setRequestTimeout] = useState<NodeJS.Timeout | null>(null)

  const uri = decodeURIComponent(router.query.uri as string || '')
  const requestId = router.query.requestId as string

  const removeTimeout = useCallback(() => {
    if (requestTimeout) {
      clearTimeout(requestTimeout)
    }
  }, [requestTimeout])

  useEffect(() => {
    console.log(`URI Received: ${uri}`); // Logging the received URI
    if (state.view == 'LoadingModal') {
      const timeout = setTimeout(() => {
        setLoadingMessage('Your request is taking longer than usual. Feel free to try again.')
      }, 15_000)
      setRequestTimeout(timeout)
    } else if (state.view) {
      removeTimeout()
    }
  }, [state.view])

  useEffect(() => {
    if (requestId) {
      ModalStore.open('LoadingModal', { loadingMessage })
    }

    if (uri) {
      ModalStore.open('LoadingModal', { loadingMessage })
      // Additional check for URI validity
      if (!uri.includes('wc:') || !uri.includes('@') || !uri.includes('&symKey=')) {
        console.error('Invalid WalletConnect URI format.');
        setLoadingMessage('Invalid URI format. Please check your input and try again.');
        return; // Early return if URI is invalid
      }
    }
  }, [uri, requestId, loadingMessage])

  if (!uri && !requestId) {
    return (
        <Fragment>
          <Text css={{ opacity: '0.5', textAlign: 'center', marginTop: '$20' }}>
            No URI provided via `?uri=` params
          </Text>
        </Fragment>
    )
  }

  return <WalletConnectPage deepLink={uri} />
}
