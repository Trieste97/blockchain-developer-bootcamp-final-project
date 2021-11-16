# blockchain-developer-bootcamp-final-project
Final project for the Consensys blockchain developer bootcamp

# Base Idea
It should be a simple DApp that lets users deposit certain tokens to earn DApp token rewards periodically.
The DApp contains three main sections:
  1. Faucet: where the user can request tokens;
  2. Swapper: where the user can transform the faucet tokens into deposit tokens;
  3. Deposit: where the user can deposit tokens obtained before, earning periodically the DApp tokens;

A simple use case (let's call the user Bob):
  1. Bob uses the faucet and gets 100 tokenA;
  2. He wants to farm the native token of the DApp (let's call it Django);
  3. Bob needs the deposit tokens, so he swaps his tokenA for some deposit tokens (let's call them tokenB) in the swapper section;
  4. Therefore he puts all his tokenB in the deposit section (Bob will now periodically and passively earn Django);
  5. Some time later Bob claims the rewards earned until then, so now he possesses some Django;

# 1. Faucet
In the faucet section, it's possible to obtain the faucet ERC-20 token: tokenA (temporary names). A transaction will be sent to the faucet smart contract that will mint and give the tokens to the requester. It will have a cooldown time of 1 day before it can be used again from the same address.
The faucet token policy is static: there's a max supply set to mint, only from the faucet. Once reached the max supply, the faucet won't give tokens anymore.


# 2. Swapper
In the swapper section there are two possibilities:
- swapping faucet tokens (tokenA) for deposit tokens (tokenB): the contract will take the faucet tokens and mint the same amount of tokenB;
- swapping deposit tokens (tokenB) for the same amount of tokenA: the contract will burn the amount of tokenB and give back the same amount of tokenA;
In both cases a transaction is required from the user. Example: Bob has 100 tokenA and he swaps them for 100 tokenB.


# 3. Deposit
The deposit section allows giving tokenB to the contract to earn Django as rewards. The idea is to reward a total of 1 Django (inflationary token) every 100 tokenB deposited, per block minted since the deposit. If there're no deposits in a certain period of time, no Django are minted in that period. Example:
  - Alice deposits 100 tokenB, at block 100;
  - Bob deposits 100 tokenB, at block 200;
  - Alice withdraws all the tokens, at block 300. She earned a total of 200 Django that she can claim whenever she wants;
This section also allow users to claim the Django earned until then.
