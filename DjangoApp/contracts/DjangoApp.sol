// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "./TokenFaucet.sol";
import "./TokenPool.sol";
import "./TokenDjango.sol";

contract DjangoApp {
    // Constants
    uint REWARD_PER_BLOCK = 1;
    uint FAUCET_AMOUNT = 100;
    // Faucet tokens
    TokenFaucet public tokenA;
    TokenFaucet public tokenB;

    // Pool token
    TokenPool public tokenAB;

    // DApp native token (reward)
    TokenDjango public tokenDjango;

    // Last time an address used the faucet (it uses block.timestamp)
    mapping(address => uint256) private lastTimeFaucet;

    // Deposited pool tokens per accounts
    mapping(address => uint256) private depositedTokenBalances;

    // Django tokens earned (not withdrawn)
    mapping(address => uint256) private earnedDjangoBalances;

    // Last block update per address
    mapping(address => uint256) private lastBlockUpdate;


    constructor(address _tokenA, address _tokenB, address _tokenAB, address _tokenDjango) {
        tokenA = TokenFaucet(_tokenA);
        tokenB = TokenFaucet(_tokenB);
        tokenAB = TokenPool(_tokenAB);
        tokenDjango = TokenDjango(_tokenDjango);
    }

    // Faucet section: mints faucet tokens for the account that requested them, if at least 24 hours
    // are passed from the last time the account used this function
    function useFaucet() external {
        require(block.timestamp >= lastTimeFaucet[msg.sender] + (24 * 60 * 60), "Faucet in cooldown");
        
        lastTimeFaucet[msg.sender] = block.timestamp;
        
        tokenA.mint(msg.sender, FAUCET_AMOUNT * 10 ** tokenA.decimals());
        tokenB.mint(msg.sender, FAUCET_AMOUNT * 10 ** tokenB.decimals());
    }

    // Swapper section: receives faucet tokens and mints pool tokens (ratio 1:1)
    function swapFaucetTokensForPoolTokens(uint amountTokenA_, uint amountTokenB_) external {
        // Amounts of tokens have to be the same, swap is always 1:1 ratio
        require(amountTokenA_ == amountTokenB_);

        tokenA.transferFrom(msg.sender, address(this), amountTokenA_);
        tokenB.transferFrom(msg.sender, address(this), amountTokenB_);
        tokenAB.mint(msg.sender, amountTokenA_);
    }

    // Or viceversa
    function swapPoolTokensForFaucetTokens(uint amountTokenAB_) external {
        tokenAB.burnFrom(msg.sender, amountTokenAB_);

        tokenA.transfer(msg.sender, amountTokenAB_);
        tokenB.transfer(address(this), amountTokenAB_);
    }

    // 
    function calculateDjangoEarned(address account_) internal view returns (uint) {
        uint deposited = depositedTokenBalances[account_];
        uint lastBlock = lastBlockUpdate[account_];
        uint decimals = tokenDjango.decimals();

        return ((block.number - lastBlock ) * (10 ** decimals) * deposited * REWARD_PER_BLOCK) / (FAUCET_AMOUNT * 10 ** decimals);
    }

    function updateDjangoEarned(address account_, uint amount_) internal {
        earnedDjangoBalances[account_] = amount_;
        lastBlockUpdate[account_] = block.number;
    }

    function getDjangoEarned(address account_) external view returns (uint) {
        return earnedDjangoBalances[account_] + calculateDjangoEarned(account_);
    }

    // Deposit: takes the pool tokens and keeps track of them
    function deposit(uint amount_)  external {
        tokenAB.transferFrom(msg.sender, address(this), amount_);

        updateDjangoEarned(msg.sender, this.getDjangoEarned(msg.sender));
        depositedTokenBalances[msg.sender] += amount_;
    }

    // Withdraw: gives back the amount of pool tokens requested back
    function withdraw(uint amount_)  external {
        require(depositedTokenBalances[msg.sender] >= amount_, "Not enough deposited tokens");

        updateDjangoEarned(msg.sender, this.getDjangoEarned(msg.sender));
        depositedTokenBalances[msg.sender] -= amount_;

        tokenAB.transfer(msg.sender, amount_);
    }

    // Claim: it transfer all the earned djangos to the requester
    function claim() external {
        uint djangoEarned = this.getDjangoEarned(msg.sender);

        updateDjangoEarned(msg.sender, 0);

        tokenDjango.mint(msg.sender, djangoEarned);     
    }
}