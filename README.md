# blockchain-developer-bootcamp-final-project
Final project for the Consensys blockchain developer bootcamp

The idea is to build a simple DApp that lets users put certain tokens in a pool, making them earn DApp token rewards periodically.
The DApp contains three main sections:
  1. Faucet: where the user can request tokens;
  2. Swapper: where the user can transform the faucet tokens into pool tokens;
  3. Deposit: where the user can deposit the pool tokens, earning periodically the DApp token;

A simple use case (let's call the user Bob):
  1. Bob uses the faucet and gets 100 tokenA and 100 tokenB;
  2. He wants to farm the native token of the DApp (let's call it tokenNat);
  3. Bob needs the pool token, so he swaps his tokens for some pool tokens (let's call them tokenAB) in the swapper section;
  4. Therefore he puts all his tokenAB in the deposit section (Bob will now periodically and passively earn tokenNat);
  5. One day later Bob claims the rewards earned until then, so now he possesses some tokenNat;

# 1. Faucet
In the faucet section, it's possible to obtain two different ERC-20 tokens: tokenA and tokenB (temporary names). A transaction will be sent to the faucet smart contract that will mint and give the tokens to the requester. It will have a cooldown time of 1 day before it can be used again from the same address.
The faucet tokens policies are both static: there's a max supply set to mint, only from the faucet. Once reached the max supply, the faucet won't give tokens anymore.


# 2. Swapper
In the swapper section there are two possibilities:
- swapping faucet tokens (tokenA and tokenB) for pool tokens (tokenAB): the contract will take the faucet tokens and mint the same amount of tokenAB;
- swapping deposit tokens (tokenAB) for the same amount of tokenA/tokenB: the contract will burn the amount of tokenAB and give back the tokenA/tokenB pair;
In both cases a transaction is required from the user. Example: Bob has 100 tokenA and 100 tokenB and he swaps them for 100 tokenAB.


# 3. Deposit
The deposit section allows giving tokenAB to the contract to earn tokenNat as rewards. The idea is to reward a total of 1 tokenNat (inflationary token) every 100 tokenAB deposited, per block minted since the deposit. If there're no deposits in a certain period of time, no tokenNat are minted in that period. Example:
  - Alice deposits 100 tokenAB in the pool, at block 100;
  - Bob deposits 100 tokenAB in the pool, at block 200;
  - Alice withdraws all the tokens from the pool, at block 300. She earned a total of 200 tokenNat;
This section also allow users to claim the tokenNat earned until then.
