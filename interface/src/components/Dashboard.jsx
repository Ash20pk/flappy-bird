// File: src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import BirdGameABI from '../contracts/BirdGame.json';

function Dashboard({ userAddress }) {
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(BirdGameABI.address, BirdGameABI.abi, provider);
        const stats = await contract.getPlayerStats(userAddress);
        setPlayerStats({
          highScore: stats[0].toNumber(),
          xp: stats[1].toNumber(),
          level: stats[2].toNumber()
        });
      } catch (error) {
        console.error("Error fetching player stats:", error);
      }
      setLoading(false);
    };

    fetchPlayerStats();
  }, [userAddress]);

  if (loading) {
    return <div>Loading player stats...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Address: {userAddress}</p>
      {playerStats && (
        <div>
          <h2>Player Stats</h2>
          <p>High Score: {playerStats.highScore}</p>
          <p>XP: {playerStats.xp}</p>
          <p>Level: {playerStats.level}</p>
        </div>
      )}
      <Link to="/game">
        <button>Play Game</button>
      </Link>
    </div>
  );
}

export default Dashboard;