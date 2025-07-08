"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import WalletConnect from '../components/WalletConnect';
import TokenDeployer from '../components/TokenDeployer';
import Image from "next/image";

export default function Home() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);

  const handleWalletConnect = async (provider: ethers.providers.Web3Provider, address: string) => {
    setProvider(provider);
    setUserAddress(address);

    try {
      const network = await provider.getNetwork();
      setNetworkName(network.name);
    } catch (error) {
      console.error('Error getting network:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Token Launchpad</h1>
            <p className="text-gray-600">Deploy your custom ERC-20 token with configurable parameters</p>
          </div>
          <WalletConnect onConnect={handleWalletConnect} />
        </header>

        {userAddress ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <p className="text-sm font-medium text-blue-800">
                  Connected to {networkName || 'Unknown Network'}
                </p>
              </div>
            </div>
            <div className="p-6">
              <TokenDeployer provider={provider} userAddress={userAddress} />
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-blue-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Wallet to Begin</h2>
            <p className="text-gray-600 mb-6">
              To deploy your custom token, you need to connect your wallet first.
              Make sure you're connected to the Mumbai testnet.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        )}

        <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">About This Project</h2>
          <p className="text-gray-700 mb-4">
            This Token Launchpad allows you to deploy custom ERC-20 tokens with configurable parameters
            such as tax and burn rates, directly to the Mumbai testnet. The contracts are fully verified
            and can be viewed on PolygonScan after deployment.
          </p>
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-medium text-gray-800 mb-2">Features</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Custom token name and symbol</li>
              <li>Configurable initial supply</li>
              <li>Adjustable tax percentage (collected in your wallet)</li>
              <li>Adjustable burn percentage (tokens removed from circulation)</li>
              <li>Polygon Mumbai testnet deployment</li>
              <li>Full PolygonScan verification</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
