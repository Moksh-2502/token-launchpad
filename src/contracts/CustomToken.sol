// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomToken is ERC20, Ownable {
    uint256 public taxPercentage;
    uint256 public burnPercentage;
    address public taxWallet;
    mapping(address => bool) public excludedFromTax;

    event TaxCollected(address indexed from, address indexed to, uint256 taxAmount);
    event TokensBurned(address indexed from, uint256 burnAmount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _taxPercentage,
        uint256 _burnPercentage,
        address _taxWallet
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(_taxPercentage + _burnPercentage <= 25, "Total fees cannot exceed 25%");
        taxPercentage = _taxPercentage;
        burnPercentage = _burnPercentage;
        taxWallet = _taxWallet;

        // Mint initial supply to the contract creator
        _mint(msg.sender, initialSupply * 10 ** decimals());

        // Exclude owner and tax wallet from tax
        excludedFromTax[msg.sender] = true;
        excludedFromTax[_taxWallet] = true;
    }

    function setTaxWallet(address _taxWallet) public onlyOwner {
        require(_taxWallet != address(0), "Tax wallet cannot be zero address");
        taxWallet = _taxWallet;
        excludedFromTax[_taxWallet] = true;
    }

    function setTaxPercentage(uint256 _taxPercentage) public onlyOwner {
        require(_taxPercentage + burnPercentage <= 25, "Total fees cannot exceed 25%");
        taxPercentage = _taxPercentage;
    }

    function setBurnPercentage(uint256 _burnPercentage) public onlyOwner {
        require(taxPercentage + _burnPercentage <= 25, "Total fees cannot exceed 25%");
        burnPercentage = _burnPercentage;
    }

    function excludeFromTax(address account, bool excluded) public onlyOwner {
        excludedFromTax[account] = excluded;
    }

    function _update(address from, address to, uint256 amount) internal override {
        if (
            amount > 0 &&
            from != address(0) &&  // Not minting
            to != address(0) &&    // Not burning
            !excludedFromTax[from] &&
            !excludedFromTax[to]
        ) {
            uint256 taxAmount = (amount * taxPercentage) / 100;
            uint256 burnAmount = (amount * burnPercentage) / 100;
            uint256 transferAmount = amount - taxAmount - burnAmount;

            super._update(from, taxWallet, taxAmount);
            super._update(from, address(0), burnAmount); // Burn by sending to zero address
            super._update(from, to, transferAmount);

            emit TaxCollected(from, to, taxAmount);
            emit TokensBurned(from, burnAmount);
        } else {
            super._update(from, to, amount);
        }
    }
}
