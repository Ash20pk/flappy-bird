import React, { useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import FlappyBirdGame from '../game/FlappyBirdGame';
import BirdGameABI from '../contracts/BirdGame.json';
import { PlayerContext } from '../hooks/PlayerContext';

function GameHandler() {
  const { signer, contractAddress, playerStats } = useContext(PlayerContext);

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
    if (!signer || !playerStats || playerStats.ownedBirds.length === 0) {
      console.error("Signer not available or player has no birds");
      return;
    }

    const contract = new ethers.Contract(contractAddress, BirdGameABI.abi, signer);
    const birdId = playerStats.ownedBirds[0]; 
    const gameId = await contract.currentGameId();

    // Create the message hash
    const messageHash = ethers.utils.solidityKeccak256(
      ['uint256', 'uint256', 'uint256'],
      [birdId, gameId, finalScore]
    );

    // Sign the message hash
    const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));

    // Submit the score
    await contract.submitScore(birdId, gameId, finalScore, signature);
  };

  return <FlappyBirdGame onGameOver={handleGameOver} />;
}

export default GameHandler;