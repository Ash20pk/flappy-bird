import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { PlayerProvider } from './hooks/PlayerContext'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Create an Apollo Client instance
const client = new ApolloClient({
  uri: process.env.VITE_SUBGRAPH_URL,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   <ApolloProvider client={client}>
    <PlayerProvider>
      <App />
    </PlayerProvider>
    </ApolloProvider>
  </React.StrictMode>,
)