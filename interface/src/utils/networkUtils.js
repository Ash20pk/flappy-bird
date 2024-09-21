const ARBITRUM_SEPOLIA_CHAIN_ID = '0x66eee';

export const switchToArbitrumSepolia = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_ID }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await addArbitrumSepoliaNetwork();
    } else {
      console.error("Failed to switch to Arbitrum Sepolia:", switchError);
      throw switchError;
    }
  }
};

const addArbitrumSepoliaNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
        chainName: 'Arbitrum Sepolia',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://sepolia.arbiscan.io/']
      }],
    });
  } catch (addError) {
    console.error("Failed to add Arbitrum Sepolia network:", addError);
    throw addError;
  }
};

export const ensureArbitrumSepoliaNetwork = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error("Ethereum provider not found");
  }
  await switchToArbitrumSepolia();
};