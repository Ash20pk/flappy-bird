import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Game from './components/GameHandler';

function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [userAddress, setUserAddress] = useState('');

  const handleRegister = (address) => {
    setIsRegistered(true);
    setUserAddress(address);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={isRegistered ? <Navigate to="/dashboard" /> : <Register onRegister={handleRegister} />} 
        />
        <Route 
          path="/dashboard" 
          element={isRegistered ? <Dashboard userAddress={userAddress} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/game" 
          element={isRegistered ? <Game userAddress={userAddress} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;