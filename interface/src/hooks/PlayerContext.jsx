import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BirdGameABI from '../contracts/BirdGame.json';
import { ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client';
import {GET_PLAYER} from '../queries/queries';
import { getWeb3Provider,getSigner, } from '@dynamic-labs/ethers-v6'
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core'

export const PlayerContext = createContext();

// Create an Apollo Client instance
const client = new ApolloClient({
  uri: process.env.VITE_SUBGRAPH_URL,
  cache: new InMemoryCache(),
});

export const PlayerProvider = ({ children }) => {
  const [playerAddress, setPlayerAddress] = useState('');
  const [playerStats, setPlayerStats] = useState(null);
  const [nftSpritesheets, setNftSpritesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { primaryWallet } = useDynamicContext()
  const isLoggedIn = useIsLoggedIn();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);



  const contractAddress = process.env.VITE_GAME_CONTRACT;


  const connectWallet = async () => {
      try {
        console.log(primaryWallet)
        const provider = await getWeb3Provider(primaryWallet);
        const signer = await getSigner(primaryWallet);
        console.log(provider,signer);
        setProvider(provider);
        setSigner(signer);
        setIsConnected(true);
        setPlayerAddress(primaryWallet.address)
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        throw error;
      }
  };

  const checkForRegistrationEvent = async (playerAddress, startBlock) => {
    const POLL_INTERVAL = 2000; // 2 seconds
    const MAX_RETRIES = 30; // 1 minute total polling time

    const query = gql`
      query GetPlayerRegisteredEvent($playerAddress: Bytes!, $startBlock: BigInt!) {
        playerRegisteredEvents(
          where: { playerAddress: $playerAddress, blockNumber_gte: $startBlock }
          first: 1
        ) {
          id
          playerAddress
          name
          blockNumber
        }
      }
    `;

    for (let i = 0; i < MAX_RETRIES; i++) {
      const response = await client.query({
        query,
        variables: { playerAddress: playerAddress.toLowerCase(), startBlock },
        fetchPolicy: 'network-only', // Bypass cache to get fresh data
      });

      if (response.data.playerRegisteredEvents.length > 0) {
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }

    return false;
  };

  const register = async (name) => {
    if (!signer) {
      throw new Error("Wallet not connected");
    }
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, BirdGameABI.abi, signer);
      
      // Get the current block number
      const currentBlock = await provider.getBlockNumber();

      // Send the registration transaction
      const tx = await contract.registerPlayer(name);
      await tx.wait();

      // Check for the registration event
      const registrationConfirmed = await checkForRegistrationEvent(playerAddress, currentBlock);

      if (registrationConfirmed) {
        // Fetch player stats after confirmation
        await fetchPlayerStats(playerAddress);
      } else {
        console.error("Registration event not found after waiting");
        throw new Error("Registration not confirmed");
      }
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
    setShowRegistrationForm(false);
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
        setShowRegistrationForm(false);
        localStorage.setItem('playerStats', JSON.stringify(data));
      } else {
        console.warn("Player not found in subgraph");
        setPlayerStats(null);
        setIsRegistered(false);
        setShowRegistrationForm(true);
      }
    } catch (error) {
      console.error("Error fetching player stats from subgraph:", error);
      setPlayerStats(null);
      setIsRegistered(false);
      setShowRegistrationForm(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if(isLoggedIn){
      await connectWallet();
      await fetchPlayerStats(primaryWallet.address);
      }
    };

    init();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchNFTSpritesheets = async () => {
      if (playerStats?.tokenOfOwnerByIndex) {
        const spritesheets = await Promise.all(playerStats.tokenOfOwnerByIndex.map(async (tokenId) => {
          const imageId = Number(tokenId) + 1;
          const tokenURI = `https://silver-blushing-woodpecker-143.mypinata.cloud/ipfs/QmXvpXL2yUX6y8MYNz8mFf387EtFQZCnow5SprP68wnH9h/${imageId}.json`;
          console.log(tokenId, tokenURI);
          const response = await fetch(tokenURI);
          const metadata = await response.json();
          return {
            src: metadata.image,
            frameWidth: metadata.frameWidth,
            frameHeight: metadata.frameHeight,
            frameCount: metadata.frameCount,
            fps: metadata.fps,
          };
        }));
        setNftSpritesheets(spritesheets);
      }
    };

    fetchNFTSpritesheets();
  }, [playerStats]);

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
      contractAddress,
      showRegistrationForm,
      nftSpritesheets
    }}>
      {children}
    </PlayerContext.Provider>
  );
};