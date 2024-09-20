import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Game from './components/GameHandler';
import { PlayerContext } from './hooks/PlayerContext';


function App() {
  const { playerAddress, isConnected} = useContext(PlayerContext);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isConnected ? <Navigate to="/dashboard" /> : <Register />} 
        />
        <Route 
          path="/dashboard" 
          element={isConnected ? <Dashboard userAddress={playerAddress} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/game" 
          element={isConnected ? <Game userAddress={playerAddress} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;