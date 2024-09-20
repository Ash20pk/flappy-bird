import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { PlayerContext } from '../hooks/PlayerContext';

const NavBar = () => {
  const { playerAddress, connectWallet, disconnectWallet, isConnected} = useContext(PlayerContext);

  return (
    <nav className="p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-black flappy-font">Flappy Game</Link>
        <div className="flex items-center space-x-4">
          {playerAddress && (
            <div className="text-sm text-black flappy-font">
              <span className="font-bold">Address:</span> {playerAddress.slice(0, 6)}...{playerAddress.slice(-4)}
            </div>
          )}
          {isConnected ? 
          <button onClick={disconnectWallet}>Disconnect</button> :
          <button onClick={connectWallet}>Connect</button>}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;