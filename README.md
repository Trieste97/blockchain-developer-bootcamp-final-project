# blockchain-developer-bootcamp-final-project
Final project for the Consensys blockchain developer bootcamp

The idea is to build a simple DApp that lets users put certain tokens in various pools, making them earn token rewards periodically.
The DApp contains three main elements:
  1. Pools: the section where the user can choose where to deposit the pool tokens;
  2. Faucet: a section where the user can request tokens used for depositing in the pools;
  3. Swapper: a section where the user can swap between the DApp tokens, both the faucet ones and the pool rewards ones;

A simple use case (let's call the user Bob):
  1. Bob uses the faucet and gets 100 tokenA and 100 tokenB;
  2. He wants to farm the native token of the DApp (let's call it tokenNat) and he notices there is a pool that requires tokenA/tokenB pair;
  3. Bob needs the pool token, so he swaps his tokens for some pool tokens (let's call them tokenAB) in the swapper section;
  4. Therefore he puts all his tokenAB in the pool (Bob will now periodically and passively earn rewards from the pool);
  5. One day later Bob claims the rewards earned until then, so now he possesses some tokenNat;
