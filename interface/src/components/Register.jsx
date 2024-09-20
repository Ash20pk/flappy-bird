import React, { useState } from 'react';
import { ethers } from 'ethers';

function Register({ onRegister }) {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        onRegister(address);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
    setIsConnecting(false);
  };

  return (
    <div>
      <h1>Welcome to Flappy Bird Game</h1>
      <button onClick={connectWallet} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect Wallet to Register'}
      </button>
    </div>
  );
}

export default Register;