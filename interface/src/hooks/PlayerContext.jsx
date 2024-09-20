import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BirdGameABI from '../contracts/BirdGame.json';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [playerAddress, setPlayerAddress] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setPlayerAddress(accounts[0]);
        setIsConnected(true);
        setProvider(provider);
        setSigner(signer);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

  const disconnectWallet = async () => {
    setPlayerAddress(null);
    setIsConnected(false);
  }

  useEffect(() => {
    const fetchPlayerStats = async () => {
      if (playerAddress) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(BirdGameABI.address, BirdGameABI.abi, provider);
          const stats = await contract.getPlayerStats(playerAddress);
          setPlayerStats({
            highScore: stats[0].toNumber(),
            xp: stats[1].toNumber(),
            level: stats[2].toNumber()
          });
        } catch (error) {
          console.error("Error fetching player stats:", error);
        }
        setLoading(false);
      }
    };

    fetchPlayerStats();
  }, [playerAddress]);

  return (
    <PlayerContext.Provider value={{ playerAddress, playerStats, connectWallet, isConnected, disconnectWallet, loading, signer, provider }}>
      {children}
    </PlayerContext.Provider>
  );
};