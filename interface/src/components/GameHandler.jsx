import React, { useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import FlappyBirdGame from '../game/FlappyBirdGame';
import BirdGameABI from '../contracts/BirdGame.json';

function GameHandler({ userAddress }) {
  const gameRef = useRef(null);
  const [game, setGame] = useState(null);

  useEffect(() => {
    const newGame = new FlappyBirdGame(gameRef.current, handleGameOver);
    setGame(newGame);

    return () => {
      if (newGame) {
        newGame.destroy();
      }
    };
  }, []);

  const handleGameOver = async (finalScore) => {
    try {
      await submitScore(finalScore);
      console.log(`Game Over! Score: ${finalScore} submitted successfully!`);
    } catch (error) {
      console.error("Error submitting score:", error);
      alert("Failed to submit score. Please try again.");
    }
  };

  const submitScore = async (finalScore) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(BirdGameABI.address, BirdGameABI.abi, signer);

    // EIP-712 signature
    const domain = {
      name: 'BirdGame',
      version: '1',
      chainId: await signer.getChainId(),
      verifyingContract: BirdGameABI.address
    };

    const types = {
      GameScore: [
        { name: 'player', type: 'address' },
        { name: 'score', type: 'uint256' }
      ]
    };

    const value = {
      player: userAddress,
      score: finalScore
    };

    const signature = await signer._signTypedData(domain, types, value);

    await contract.submitScore(userAddress, finalScore, signature);
  };

  return <div ref={gameRef} />;
}

export default GameHandler;