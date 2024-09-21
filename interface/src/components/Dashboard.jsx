import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayerContext } from '../hooks/PlayerContext';
import flappyBgImage from '../assets/background-day-landscape.png';
import flappyGroundImage from '../assets/ground-sprite.png';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DynamicWidget, useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { useNavigate } from 'react-router-dom';

const Spritesheet = ({ src, frameWidth, frameHeight, frameCount, fps, staticFrame }) => {
  const [currentFrame, setCurrentFrame] = useState(staticFrame || 0);

  useEffect(() => {
    if (!staticFrame && frameCount > 1) {
      const intervalId = setInterval(() => {
        setCurrentFrame((prevFrame) => (prevFrame + 1) % frameCount);
      }, 1000 / fps);

      return () => clearInterval(intervalId);
    }
  }, [frameCount, fps, staticFrame]);

  return (
    <div
      style={{
        width: frameWidth,
        height: frameHeight,
        backgroundImage: `url(${src})`,
        backgroundPosition: `-${currentFrame * frameWidth}px 0px`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${frameWidth * frameCount}px ${frameHeight}px`,
      }}
    />
  );
};

const Dashboard = () => {
  const {disconnectWallet, loading, playerStats, nftSpritesheets} = useContext(PlayerContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const isLoggedIn = useIsLoggedIn();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      disconnectWallet();
    }
  }, [isLoggedIn, navigate, disconnectWallet]);

  useEffect(() => {
    if (nftSpritesheets.length > 0) {
      const nft = nftSpritesheets[currentImageIndex];
      setSelectedNFT(nft);
      // Write the selected NFT to localStorage
      localStorage.setItem('selectedNFT', JSON.stringify(nft));
    }
  }, [nftSpritesheets, currentImageIndex]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % nftSpritesheets.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + nftSpritesheets.length) % nftSpritesheets.length);
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
       <DynamicWidget/>
      </div>
      
      {/* Main dashboard content */}
      <div className="flex-grow flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-yellow-300 rounded-xl shadow-lg p-6 relative z-10">
          <div className="relative">
            <h1 className="text-5xl font-bold text-center text-white mb-8 flappy-font shadow-text">Welcome {playerStats.name}</h1>
            
            {/* NFT Spritesheet Carousel */}
            {selectedNFT && (
              <div className="mb-8 relative">
                <div className="w-full h-24 flex items-center justify-center">
                  <div style={{ transform: 'scale(2)' }}> {/* Scale up the sprite for better visibility */}
                    <Spritesheet 
                      src={selectedNFT.src} 
                      frameWidth={34} 
                      frameHeight={24} 
                      frameCount={selectedNFT.frameCount || 3} 
                      fps={selectedNFT.fps || 10} 
                      staticFrame={1}  // Set to null for animation, or a number for static frame
                    />
                  </div>
                </div>
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