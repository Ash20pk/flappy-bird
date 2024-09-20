import React, { useContext, useState, useEffect } from 'react';
import { PlayerContext } from '../hooks/PlayerContext';
import { useNavigate } from 'react-router-dom';
import flappyBgImage from '../assets/background-day-landscape.png'; 
import flappyGroundImage from '../assets/ground-sprite.png'; 

function Register() {
  const { connectWallet, isConnected, playerAddress } = useContext(PlayerContext);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && playerAddress) {
      navigate('/dashboard');
    }
  }, [isConnected, playerAddress, navigate]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
    setIsConnecting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Flappy Bird background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${flappyBgImage})` }}
      ></div>
      
      {/* Moving ground */}
      <div className="absolute bottom-0 left-0 w-full h-24 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[200%] h-full bg-repeat-x animate-move-ground"
             style={{ backgroundImage: `url(${flappyGroundImage})` }}>
        </div>
      </div>
      
      <div className="bg-yellow-300 p-8 rounded-xl shadow-lg text-center relative z-10">
        <h1 className="text-4xl font-bold mb-6 text-white flappy-font shadow-text">Welcome to Flappy Bird Game</h1>
        <button 
          onClick={handleConnect} 
          disabled={isConnecting}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flappy-font text-xl shadow-lg disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet to Register'}
        </button>
      </div>
    </div>
  );
}

export default Register;