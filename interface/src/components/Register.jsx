import React, { useContext, useState, useEffect } from 'react';
import { PlayerContext } from '../hooks/PlayerContext';
import { useNavigate } from 'react-router-dom';
import flappyBgImage from '../assets/background-day-landscape.png'; 
import flappyGroundImage from '../assets/ground-sprite.png'; 
import {
  DynamicWidget,
  useIsLoggedIn
} from "@dynamic-labs/sdk-react-core";

function Register() {
  const { register, isRegistered, isConnected, playerAddress, loading, fetchPlayerStats, showRegistrationForm, disconnectWallet } = useContext(PlayerContext);
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (isConnected && playerAddress) {
        try {
          await fetchPlayerStats(playerAddress);
          if (isRegistered) {
            navigate('/dashboard');
          }
        } catch (error) {
          console.error("Error fetching player stats:", error);
        }
      }
    };

    checkUserStatus();
  }, [isRegistered]);

  useEffect(() => {
    if (!isLoggedIn) {
      disconnectWallet();
    }
  }, [isLoggedIn]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (name.trim() === '') {
      alert("Please enter a valid name.");
      return;
    }
    try {
      await register(name);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error registering:", error);
      alert("Failed to register. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 m-4 z-20">
      <DynamicWidget/>
      </div>
      
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${flappyBgImage})` }}
      />
      
      <div className="absolute bottom-0 left-0 w-full h-24 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[200%] h-full bg-repeat-x animate-move-ground"
             style={{ backgroundImage: `url(${flappyGroundImage})` }}
        />
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-yellow-300 p-8 rounded-xl shadow-lg text-center relative z-10">
          <h1 className="text-4xl font-bold mb-6 text-white flappy-font shadow-text">Welcome to Flappy Bird Game</h1>
          
          {!isConnected && (
            <p className="text-xl text-white flappy-font shadow-text">Connect your wallet to continue</p>
          )}

          {isConnected && showRegistrationForm && (
            <form onSubmit={handleRegister} className="mt-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flappy-font text-xl shadow-lg disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;