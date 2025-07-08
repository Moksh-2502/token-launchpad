import { useState } from 'react';
import { ethers } from 'ethers';
import TokenForm, { TokenParameters } from './TokenForm';
import {
  deployTokenContract,
  getPolygonScanUrl,
  isMumbaiNetwork,
  TokenDeploymentParams
} from '../utils/contract-utils';

interface TokenDeployerProps {
  provider: ethers.providers.Web3Provider | null;
  userAddress: string | null;
}

interface DeploymentResult {
  success: boolean;
  address?: string;
  txHash?: string;
  error?: string;
}

const TokenDeployer = ({ provider, userAddress }: TokenDeployerProps) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);

  const [transactionStatus, setTransactionStatus] = useState<'waiting' | 'mining' | 'completed' | null>(null);

  const deployToken = async (tokenParams: TokenParameters) => {
    if (!provider || !userAddress) {
      setDeploymentResult({
        success: false,
        error: 'Wallet not connected'
      });
      return;
    }
    
    // Verify the user is on Mumbai network
    const isOnMumbai = await isMumbaiNetwork(provider);
    if (!isOnMumbai) {
      setDeploymentResult({
        success: false,
        error: 'Please connect to the Polygon Mumbai testnet to deploy tokens'
      });
      return;
    }

    try {
      setIsDeploying(true);
      setDeploymentResult(null);
      setTransactionStatus('waiting');
      
      // Validate inputs before deployment
      if (parseInt(tokenParams.initialSupply) <= 0) {
        throw new Error('Initial supply must be greater than 0');
      }
      
      if (parseFloat(tokenParams.taxPercentage) < 0 || parseFloat(tokenParams.taxPercentage) > 10) {
        throw new Error('Tax percentage must be between 0 and 10');
      }
      
      if (parseFloat(tokenParams.burnPercentage) < 0 || parseFloat(tokenParams.burnPercentage) > 10) {
        throw new Error('Burn percentage must be between 0 and 10');
      }
      
      // Prepare deployment parameters
      const deployParams: TokenDeploymentParams = {
        tokenName: tokenParams.name,
        tokenSymbol: tokenParams.symbol,
        initialSupply: parseInt(tokenParams.initialSupply),
        taxPercentage: parseFloat(tokenParams.taxPercentage),
        burnPercentage: parseFloat(tokenParams.burnPercentage),
        taxWallet: userAddress // tax wallet is the deployer
      };
      
      // Deploy the token using our utility function
      const { contract, deployTransaction } = await deployTokenContract(provider, deployParams);
      
      // Update status to mining after transaction is sent
      setTransactionStatus('mining');
      
      // Wait for deployment to complete with transaction receipt
      const receipt = await deployTransaction.wait();
      
      if (receipt.status !== 1) {
        throw new Error('Transaction failed during mining');
      }
      
      setTransactionStatus('completed');
      setDeploymentResult({
        success: true,
        address: contract.address,
        txHash: deployTransaction.hash
      });
      
    } catch (error: any) {
      console.error('Error deploying token:', error);
      
      // Handle user rejection separately
      if (error.code === 4001) { // MetaMask user rejected
        setDeploymentResult({
          success: false,
          error: 'Transaction was rejected in your wallet'
        });
      } else {
        setDeploymentResult({
          success: false,
          error: error.message || 'Unknown error occurred during deployment'
        });
      }
      
      setTransactionStatus(null);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-8">
      <TokenForm onSubmit={deployToken} isSubmitting={isDeploying} />
      
      {isDeploying && (
        <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            <p className="text-blue-700 font-medium">
              {transactionStatus === 'waiting' && 'Waiting for wallet confirmation...'}
              {transactionStatus === 'mining' && 'Transaction submitted, deploying your token...'}
              {transactionStatus === 'completed' && 'Finalizing deployment...'}
              {!transactionStatus && 'Preparing deployment...'}
            </p>
          </div>
          {transactionStatus === 'waiting' && (
            <p className="text-sm text-blue-600 mt-2">Please confirm the transaction in your wallet.</p>
          )}
          {transactionStatus === 'mining' && (
            <p className="text-sm text-blue-600 mt-2">This may take a minute. Please don't close this page.</p>
          )}
        </div>
      )}
      
      {deploymentResult && (
        <div className={`p-6 rounded-md ${deploymentResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
          {deploymentResult.success ? (
            <>
              <h3 className="text-xl font-bold text-green-700 mb-2">Token Deployed Successfully</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Token Address:</span>{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    {deploymentResult.address}
                  </code>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Transaction Hash:</span>{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    {deploymentResult.txHash}
                  </code>
                </p>
                <div className="mt-4">
                  <a 
                    href={getPolygonScanUrl(deploymentResult.address || '', true)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View on PolygonScan
                  </a>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-red-700 mb-2">Deployment Failed</h3>
              <p className="text-red-600">{deploymentResult.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenDeployer;
