import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getNetworkName } from '../utils/contract-utils';

// Define the Ethereum provider interface to match ethers.js ExternalProvider
declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider & {
      isMetaMask?: boolean;
      selectedAddress?: string;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

interface WalletConnectProps {
  onConnect: (provider: ethers.providers.Web3Provider, address: string) => void;
}

const WalletConnect = ({ onConnect }: WalletConnectProps) => {
  const [address, setAddress] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState<string>('');
  const [connecting, setConnecting] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean | null>(null);

  // Handle network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = async (chainId: string) => {
      // Force page refresh on chain change as recommended by MetaMask
      window.location.reload();
    };

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        setAddress(null);
      } else if (accounts[0] !== address) {
        // Account changed, update state
        setAddress(accounts[0]);
        if (window.ethereum) {
          // Safe to create provider because we checked window.ethereum exists
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          onConnect(provider, accounts[0]);
        }
      }
    };

    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    // Check if already connected
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        // Make sure window.ethereum exists before using it
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          onConnect(provider, accounts[0]);
          
          const network = await provider.getNetwork();
          const networkName = await getNetworkName(provider);
          setNetworkInfo(networkName);
        }
      }
    };
    
    checkConnection();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [address, onConnect]);

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window !== 'undefined') {
      setIsMetaMaskInstalled(!!window.ethereum);
      
      if (!window.ethereum) {
        console.log('MetaMask is not installed');
        return;
      }
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      // Open MetaMask installation page in a new tab
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      setConnecting(true);
      
      // Request account access using typesafe approach
      // First check that request method exists
      if (typeof window.ethereum.request !== 'function') {
        throw new Error('Ethereum provider does not support request method');
      }
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      const userAddress = accounts[0];
      setAddress(userAddress);

      // Create a provider - safe to use window.ethereum as we've checked it exists
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Get network information
      const networkName = await getNetworkName(provider);
      setNetworkInfo(networkName);
      
      // Call the onConnect callback with the provider and address
      onConnect(provider, userAddress);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please ensure you have MetaMask installed and try again.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div>
      {!address ? (
        isMetaMaskInstalled === false ? (
          <div className="flex flex-col space-y-2">
            <button 
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md shadow transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16.62 2.99c-.49-.49-1.49-.32-1.91.24l-5.51 6.94-3.82-3.95c-.45-.39-1.11-.32-1.56.02-.42.41-.45 1.1-.03 1.56l4.37 5.2c.18.19.43.3.69.3h.2c.33 0 .67-.18.83-.45l6.37-7.45c.4-.47.37-1.24-.07-1.71l.44.3z"></path>
              </svg>
              Install MetaMask
            </button>
            <p className="text-xs text-gray-500">MetaMask is required to deploy tokens on Mumbai testnet</p>
          </div>
        ) : (
          <button 
            onClick={connectWallet} 
            disabled={connecting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow transition-colors"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )
      ) : (
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-md">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              {address.substring(0, 6)}...{address.substring(address.length - 4)}
            </span>
          </div>
          {networkInfo && (
            <span className="text-xs text-gray-500 mt-1">
              {networkInfo}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
