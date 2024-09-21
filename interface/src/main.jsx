import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { PlayerProvider } from './hooks/PlayerContext'
import {
  DynamicContextProvider,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DynamicContextProvider
      settings={{
        environmentId: "d00e12c8-5c4b-489a-bec7-7c778119aa97",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <PlayerProvider>
      <App />
      </PlayerProvider>
    </DynamicContextProvider>
  </React.StrictMode>,
)