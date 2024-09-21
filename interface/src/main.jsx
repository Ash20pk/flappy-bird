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
        environmentId: "81b1d717-7e64-4ede-b223-03084ae843d5",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <PlayerProvider>
      <App />
      </PlayerProvider>
    </DynamicContextProvider>
  </React.StrictMode>,
)