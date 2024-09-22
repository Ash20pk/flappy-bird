import React, { useCallback, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import FlappyBirdGame from '../game/FlappyBirdGame';
import BirdGameABI from '../contracts/BirdGame.json';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { PlayerContext } from '../hooks/PlayerContext';

function GameHandler() {
  const { contractAddress, playerAddress } = useContext(PlayerContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playerStats, setPlayerStats] = useState(null);

  const provider = new ethers.BrowserProvider(window.ethereum);
  const privateKey = process.env.VITE_PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey);
  const signer = wallet.connect(provider);
  const isLoggedIn = useIsLoggedIn();
  const contract = new ethers.Contract(contractAddress, BirdGameABI.abi, signer);


  useEffect(() => {
    const playerStats = JSON.parse(localStorage.getItem('playerStats'));
    if(playerStats){
      setPlayerStats(playerStats);
    }
  },[])


  const handleGameOver = useCallback(async (finalScore) => {
    try {
      await submitScore(finalScore);
      console.log(`Game Over! Score: ${finalScore} submitted successfully!`);
    } catch (error) {
      console.error("Error submitting score:", error);
      alert("Failed to submit score. Please try again.");
    }
  }, []);

  const submitScore = async (finalScore) => {
    if (!playerStats) {
      console.error("Player has no birds");
      return;
    }

    try {
      setIsSubmitting(true);

      const birdId = playerStats.player.tokenOfOwnerByIndex[0];
      const gameId = await contract.currentGameId().toString();

      console.log('contract ====> ', contract);
     console.log('birdId', birdId);
     console.log('gameId', gameId);
     console.log('playerAddress', playerAddress);
     console.log('finalScore', finalScore);
      const tx = await contract.submitScore(birdId, gameId, playerAddress, finalScore
      );


      await tx.wait();
      console.log("Score submitted successfully. Transaction hash:", tx.hash);
      localStorage.removeItem(`selectedNFT`);

    } catch (error) {
      console.error("Error in submitScore:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return <FlappyBirdGame onGameOver={handleGameOver} />;
}

export default GameHandler;