import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { createTheme, NextUIProvider } from '@nextui-org/react'

import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import useWalletConnectEventsManager from '@/hooks/useWalletConnectEventsManager'
import { web3wallet } from '@/utils/WalletConnectUtil'
import { RELAYER_EVENTS } from '@walletconnect/core'
import { AppProps } from 'next/app'
import '../../public/main.css'
import { styledToast } from '@/utils/HelperUtil'
import useKeepKey from '@/hooks/useKeepKey'

export default function App({ Component, pageProps }: AppProps) {
  // const [keepkey, setKeepKey] = useState(false);
  // Step 1 - Initialize wallets and wallet connect client
  // const initialized = useInitialization()
  const keepkeyInit = useKeepKey()
  // setKeepKey(keepkeyInit)

  // Step 2 - Once initialized, set up wallet connect event manager
  useWalletConnectEventsManager(keepkeyInit)


  useEffect(() => {
    if (!keepkeyInit) return
    web3wallet?.core.relayer.on(RELAYER_EVENTS.connect, () => {
      styledToast('Network connection is restored!', 'success')
    })

    web3wallet?.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
      styledToast('Network connection lost.', 'error')
    })
  }, [keepkeyInit])

  return (
    <NextUIProvider theme={createTheme({ type: 'dark' })}>
      <Layout initialized={keepkeyInit}>
        <Toaster />
        <Component {...pageProps} />
      </Layout>

      <Modal/>
    </NextUIProvider>
  )
}
