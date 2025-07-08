# Token Launchpad

Token Launchpad is a decentralized application (dApp) that allows users to deploy custom ERC-20 tokens on the Polygon Mumbai testnet with configurable parameters like tax and burn rates.

## Features

- Deploy custom ERC-20 tokens with your own name and symbol
- Configure initial token supply
- Set customizable transaction tax percentage (collected in your wallet)
- Set customizable token burn percentage (removed from circulation)
- Integrated wallet connection via MetaMask
- Direct link to view your deployed token on PolygonScan

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Smart Contract**: Solidity, Hardhat
- **Web3**: ethers.js
- **Blockchain**: Polygon Mumbai Testnet

## Prerequisites

- Node.js (v14+ recommended)
- MetaMask browser extension
- Some MATIC tokens on the Mumbai testnet for gas fees

## Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/token-launchpad.git
cd token-launchpad
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
```

## Running the Project

### Compile Smart Contracts

```bash
npx hardhat compile
```

This will create the artifacts directory that contains the ABI and bytecode needed for deploying the token contract.

### Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## Usage

1. Connect your wallet using the "Connect Wallet" button
2. Make sure you're connected to the Mumbai testnet in MetaMask
3. Fill in the token parameters:
   - Token Name (e.g., "My Token")
   - Token Symbol (e.g., "MTK")
   - Initial Supply
   - Tax Percentage
   - Burn Percentage
4. Click "Deploy Token"
5. Confirm the transaction in your wallet
6. Once deployed, you'll receive the token address and a link to view it on PolygonScan

## Smart Contract Details

The ERC-20 token contract includes the following features:

- Standard ERC-20 functionality (transfer, approve, etc.)
- Customizable tax percentage that sends tokens to a specified wallet
- Customizable burn percentage that removes tokens from circulation
- Owner controls for updating parameters
- Maximum combined fee limit of 25% to prevent abuse

## Development Notes

- The contract is deployed to the Mumbai testnet for testing purposes
- You can modify the Hardhat configuration to deploy to other networks
- Make sure to have sufficient test MATIC for gas fees

## License

MIT
