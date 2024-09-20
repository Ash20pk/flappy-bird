import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import BirdGameABI from '../contracts/BirdGame.json';

const Dashboard = ({ userAddress }) => {
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
    return (
      <div className="flex items-center justify-center h-screen bg-sky-300">
        <div className="text-2xl font-bold text-white pixel-font">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-yellow-300 rounded-xl shadow-lg p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-green-400"></div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-green-600"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-center text-white mb-6 pixel-font shadow-text">Flappy Dashboard</h1>
          <div className="bg-white bg-opacity-80 rounded-lg p-4 mb-6 shadow-inner">
            <p className="text-gray-800 text-sm truncate">Address: {userAddress}</p>
          </div>
          {playerStats && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-3 text-center shadow">
                <p className="text-lg font-bold text-yellow-500 pixel-font">High Score</p>
                <p className="text-2xl font-bold text-yellow-600 pixel-font">{playerStats.highScore}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow">
                <p className="text-lg font-bold text-green-500 pixel-font">XP</p>
                <p className="text-2xl font-bold text-green-600 pixel-font">{playerStats.xp}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow">
                <p className="text-lg font-bold text-red-500 pixel-font">Level</p>
                <p className="text-2xl font-bold text-red-600 pixel-font">{playerStats.level}</p>
              </div>
            </div>
          )}
          <Link to="/game" className="block">
            <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 pixel-font text-xl shadow-lg">
              PLAY
            </button>
          </Link>
        </div>
        <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 w-12 h-12 bg-yellow-400 rounded-full shadow-inner"></div>
      </div>
    </div>
  );
}

export default Dashboard;