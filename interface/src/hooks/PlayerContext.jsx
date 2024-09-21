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

      // Ensure the user is on the correct network
      await ensureArbitrumSepoliaNetwork();
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await provider.getSigner();
      setPlayerAddress(await signer.getAddress());
      setIsConnected(true);
      setProvider(provider);
      setSigner(signer);
      await fetchPlayerStats(await signer.getAddress());
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
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
    } catch (error) {
      console.error("Failed to register player:", error);
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setPlayerAddress('');
    setIsConnected(false);
    setSigner(null);
    setProvider(null);
    setIsRegistered(false);
    setPlayerStats(null);
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
    const init = async () => {
      if (playerAddress) {
        await fetchPlayerStats(playerAddress);
        console.log(isRegistered);
      } else {
        setLoading(false);
      }
    };

    init();
  }, [isConnected]);

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