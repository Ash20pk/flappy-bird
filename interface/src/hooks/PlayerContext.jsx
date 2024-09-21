import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BirdGameABI from '../contracts/BirdGame.json';

export const PlayerContext = createContext();

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
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await provider.getSigner();
        setPlayerAddress(await signer.getAddress());
        setIsConnected(true);
        setProvider(provider);
        setSigner(signer);
        await fetchPlayerStats();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        throw error;
      }
    } else {
      throw new Error("Ethereum provider not found");
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

  const fetchPlayerStats = async () => {
    if (!playerAddress || !isConnected || !signer) {
      return;
    }
    try {
      const contract = new ethers.Contract(contractAddress, BirdGameABI.abi, signer);
      const stats = await contract.getPlayerStats(playerAddress);
      setIsRegistered(stats[4])
      console.log(stats[4]);
      if (stats && stats.length >= 3) {
        setPlayerStats({
          name: stats[0],
          highScore: stats[1].toString(),
          xp: stats[2].toString(),
          level: stats[3].toString(),
          isRegistered: stats[4]
        });
      } else {
        console.warn("Unexpected player stats format:", stats);
        setPlayerStats(null);
      }
    } catch (error) {
      console.error("Error fetching player stats:", error);
      setPlayerStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (playerAddress) {
        await fetchPlayerStats();
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
      fetchPlayerStats
    }}>
      {children}
    </PlayerContext.Provider>
  );
};