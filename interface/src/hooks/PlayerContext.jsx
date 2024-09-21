import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BirdGameABI from '../contracts/BirdGame.json';
import { ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client';
import {GET_PLAYER} from '../queries/queries';
import { ensureArbitrumSepoliaNetwork } from '../utils/networkUtils';

export const PlayerContext = createContext();

// Create an Apollo Client instance
const client = new ApolloClient({
  uri: process.env.VITE_SUBGRAPH_URL,
  cache: new InMemoryCache(),
});

export const PlayerProvider = ({ children }) => {
  const [playerAddress, setPlayerAddress] = useState('');
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const contractAddress = process.env.VITE_GAME_CONTRACT;

  const connectWallet = async () => {
    try {
      await ensureArbitrumSepoliaNetwork();
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setPlayerAddress(address);
      setIsConnected(true);
      setProvider(provider);
      setSigner(signer);
      await fetchPlayerStats(address);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    setPlayerAddress('');
    setIsConnected(false);
    setSigner(null);
    setProvider(null);
    setIsRegistered(false);
    setPlayerStats(null);

    // For MetaMask and most other wallets, we can't forcefully disconnect
    // But we can prompt the user to disconnect manually
    if (window.ethereum) {
      alert("Please disconnect your wallet manually from the MetaMask extension.");
    }
  };

  const register = async (name) => {
    if (!signer) {
      throw new Error("Wallet not connected");
    }
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, BirdGameABI.abi, signer);
      const tx = await contract.registerPlayer(name);
      await tx.wait();
      await fetchPlayerStats(await signer.getAddress());
    } catch (error) {
      console.error("Failed to register player:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerStats = async (address) => {
    if (!address) {
      return;
    }
    try {
      setLoading(true);
      const response = await client.query({
        query: GET_PLAYER,
        variables: { id: address.toLowerCase() },
      });

      const { data } = response || {};
      console.log(data);
      
      if (data && data.player) {
        setPlayerStats({
          name: data.player.name,
          highScore: data.player.highScore,
          xp: data.player.xp,
          level: data.player.level,
          balance: data.player.balance,
          tokenOfOwnerByIndex: data.player.tokenOfOwnerByIndex,
        });
        setIsRegistered(true);
      } else {
        console.warn("Player not found in subgraph");
        setPlayerStats(null);
        setIsRegistered(false);
      }
    } catch (error) {
      console.error("Error fetching player stats from subgraph:", error);
      setPlayerStats(null);
      setIsRegistered(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        try {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setPlayerAddress(address);
            setIsConnected(true);
            setSigner(signer);
            await fetchPlayerStats(address);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        } finally {
          setLoading(false);
        }

        // Set up listeners for account and network changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
      } else {
        setLoading(false);
      }
    };

    checkConnection();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      await disconnectWallet();
    } else {
      // User switched to a different account
      const newAddress = accounts[0];
      setPlayerAddress(newAddress);
      setIsConnected(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setSigner(signer);
      await fetchPlayerStats(newAddress);
    }
  };

  return (
    <PlayerContext.Provider value={{ 
      playerAddress, 
      playerStats, 
      connectWallet, 
      isConnected, 
      disconnectWallet, 
      loading, 
      signer, 
      provider, 
      register, 
      isRegistered,
      fetchPlayerStats,
      contractAddress
    }}>
      {children}
    </PlayerContext.Provider>
  );
};