import React, { useCallback, useContext, useState } from 'react';
import { ethers } from 'ethers';
import FlappyBirdGame from '../game/FlappyBirdGame';
import BirdGameABI from '../contracts/BirdGame.json';
import { PlayerContext } from '../hooks/PlayerContext';

function GameHandler() {
  const { contractAddress, playerStats, playerAddress } = useContext(PlayerContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const privateKey = process.env.VITE_PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey);
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = wallet.connect(provider);
  const contract = new ethers.Contract(contractAddress, BirdGameABI.abi, signer);


  console.log(playerStats);
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
    if (!signer || !playerStats) {
      console.error("Signer not available or player has no birds");
      return;
    }

    try {
      setIsSubmitting(true);
      const birdId = playerStats.tokenOfOwnerByIndex[0];
      const gameId = await contract.currentGameId();
      const chainId = 421614;
  

      // Prepare the data for signing
      const domain = {
        name: "BirdGame",
        version: "1",
        chainId: chainId,
        verifyingContract: contractAddress
      };

      const types = {
        SubmitScore: [
          { name: "birdId", type: "uint256" },
          { name: "gameId", type: "uint256" },
          {name: "playerAddress", type: "address"},
          { name: "score", type: "uint256" }
        ]
      };

      const value = {
        birdId: birdId.toString(),
        gameId: gameId.toString(),
        playerAddress: playerAddress.toString(),
        score: finalScore.toString()
      };

      console.log("Value object:", value);

      // Sign the typed data
      const signature = await signer.signTypedData(domain, types, value);
      const { v, r, s } = ethers.Signature.from(signature);

      // Submit the score
      const tx = await contract.submitScore(
        birdId.toString(),
        gameId.toString(),
        playerAddress.toString(),
        finalScore.toString(),
        v,
        r,
        s
      );
      await tx.wait();
      localStorage.removeItem(`selectedNFT`)

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