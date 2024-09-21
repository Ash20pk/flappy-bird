import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayerContext } from '../hooks/PlayerContext';
import flappyBgImage from '../assets/background-day-landscape.png';
import flappyGroundImage from '../assets/ground-sprite.png';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BirdGameABI from '../contracts/BirdGame.json';
import { ethers } from 'ethers';

const Dashboard = () => {
  const { playerAddress, connectWallet, disconnectWallet, isConnected, loading, playerStats, provider, contractAddress } = useContext(PlayerContext);
  const [nftImages, setNftImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchNFTImages = async () => {
      if (playerStats.tokenOfOwnerByIndex) {
        const contract = new ethers.Contract(contractAddress, BirdGameABI.abi, provider);
        const images = await Promise.all(playerStats.tokenOfOwnerByIndex.map(async (tokenId) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const response = await fetch(tokenURI+1);
          const metadata = await response.json();
          return metadata.image;
        }));
        setNftImages(images);
      }
    };

    fetchNFTImages();
  }, [playerStats.tokenOfOwnerByIndex]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % nftImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + nftImages.length) % nftImages.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-sky-300">
        <div className="text-4xl font-bold text-white flappy-font">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
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
      
      {/* Wallet connection section at top right of screen */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
        {playerAddress && (
          <div className="text-sm text-black flappy-font bg-white px-2 py-1 rounded shadow-md">
            <span className="font-bold">Address:</span> { playerAddress.slice(0, 6)}...{playerAddress.slice(-4)}
          </div>
        )}
        {isConnected ? 
          <button onClick={disconnectWallet} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flappy-font text-sm shadow-md transition duration-300">Disconnect</button> :
          <button onClick={connectWallet} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flappy-font text-sm shadow-md transition duration-300">Connect</button>
        }
      </div>
      
      {/* Main dashboard content */}
      <div className="flex-grow flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-yellow-300 rounded-xl shadow-lg p-6 relative z-10">
          <div className="relative">
            <h1 className="text-5xl font-bold text-center text-white mb-8 flappy-font shadow-text">Welcome {playerStats.name}</h1>
            
            {/* NFT Image Carousel */}
            {nftImages.length > 0 && (
              <div className="mb-8 relative">
                <img src={nftImages[currentImageIndex]} alt="Player NFT" className="w-full h-64 object-cover rounded-lg shadow-md" />
                <button onClick={prevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md">
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
            
            {playerStats && (
              <div className="grid grid-cols-1 gap-6 mb-8">
                <div className="bg-white rounded-lg p-4 text-center shadow transform hover:scale-105 transition-transform duration-200">
                  <p className="text-3xl font-bold text-yellow-500 flappy-font">High Score</p>
                  <p className="text-5xl font-bold text-yellow-600 flappy-font">{playerStats.highScore}</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow transform hover:scale-105 transition-transform duration-200">
                  <p className="text-3xl font-bold text-green-500 flappy-font">XP</p>
                  <p className="text-5xl font-bold text-green-600 flappy-font">{playerStats.xp}</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow transform hover:scale-105 transition-transform duration-200">
                  <p className="text-3xl font-bold text-red-500 flappy-font">Level</p>
                  <p className="text-5xl font-bold text-red-600 flappy-font">{playerStats.level}</p>
                </div>
              </div>
            )}
            <Link to="/game" className="block">
              <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold rounded-full transition duration-300 ease-in-out transform hover:scale-105 flappy-font text-3xl shadow-lg">
                PLAY NOW
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;