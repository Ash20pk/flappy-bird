import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Game from './components/GameHandler';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core'

function App() {
  const isLoggedIn = useIsLoggedIn();

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<Register />} 
        />
        <Route 
          path="/dashboard" 
          element={<Dashboard/>} 
        />
        <Route 
          path="/game" 
          element={<Game/>} 
        />
      </Routes>
    </Router>
  );
}

export default App;