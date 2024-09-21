import React, { useContext, useState, useEffect } from 'react';
import { PlayerContext } from '../hooks/PlayerContext';
import { useNavigate } from 'react-router-dom';
import flappyBgImage from '../assets/background-day-landscape.png'; 
import flappyGroundImage from '../assets/ground-sprite.png'; 

function Register() {
  const { connectWallet, isConnected, playerAddress, register, disconnectWallet, isRegistered } = useContext(PlayerContext);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isRegistered) {
      navigate('/dashboard');
    }
  }, [isRegistered, navigate]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      if (!isRegistered){
      setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
      disconnectWallet();
    }
    setIsConnecting(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (name.trim() === '') {
      alert("Please enter a valid name.");
      return;
    }
    try {
      await register(name);
      setIsModalOpen(false);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error registering:", error);
      alert("Failed to register. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${flappyBgImage})` }}
      ></div>
      
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Enter Your Name</h2>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                required
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mr-2 px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;