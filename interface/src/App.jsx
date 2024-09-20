import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Game from './components/GameHandler';
import NavBar from './components/NavBar';
import { PlayerContext } from './hooks/PlayerContext';


function App() {
  const { playerAddress, connectWallet, disconnectWallet, isConnected} = useContext(PlayerContext);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userAddress, setUserAddress] = useState('');

  return (
    <Router>
      <div className="">
        <NavBar />
      <Routes>
        <Route 
          path="/" 
          element={isConnected ? <Navigate to="/dashboard" /> : <Register />} 
        />
        <Route 
          path="/dashboard" 
          element={isConnected ? <Dashboard userAddress={userAddress} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/game" 
          element={isConnected ? <Game userAddress={userAddress} /> : <Navigate to="/" />} 
        />
      </Routes>
      </div>
    </Router>
  );
}

export default App;