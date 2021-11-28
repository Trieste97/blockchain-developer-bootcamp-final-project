# DjangoApp - A small DeFi environment simulator
A live Ropsten version of this project is live at https://djangoapp.ddns.net  
Public Ethereum address for NFT certification: 0xfE469bF0Cd71cf430C6d1B82f5DDCDfb15CDcC67

## The project description and usage

### Description
This DApp uses three different ERC20 tokens: TKA, TKB and DJG.  
The base idea is very simple: let users freely earn the DApp native tokens: DJGs.  
Djangos can only be obtained by depositing TKBs. Once a user deposits some TKBs, he will get 1 DJG every 100 TKBs deposited and every block mined since the deposit block. Of course, if the user withdraws all the TKBs, it won't generate DJGs anymore.  
The user can have TKBs by swapping them for TKAs in the DApp Swapper section. The two tokens are always swapped with a 1:1 ratio.  
To get some TKAs, the user needs to use the faucet, where he can get 100 TKAs every 24 hours.

### Simple use case
1. A user (let's call her Alice) wants to get some DJG;
2. Alice connects her wallet to the website: she has 0 TKA, 0 TKB and 0 DJG;
3. She uses the faucet for the first time and she gets 100 TKA;
4. She needs to swap her TKAs for TKBs, so she approves the TKA and she swaps all of them;
5. Alice knows that she needs to deposit her TKBs, so she approves them and then she deposits all of them;
6. Having deposited 100 TKB, she is now earning 1 DJG every block mined (approximately every 13 seconds);
7. After some time, she decides to claim her DJG earned (let's suppose after 100 blocks) and she gets 100 DJG;

### Screen cast
https://youtu.be/HlbBR8-Vf44


## The technical part

### How to run it locally

#### Requirements
+ NodeJS >= v10.19.0
+ npm >= v6.14.4
+ Ganache >= v2.6.0
+ Truffle >= v5.4.22

Minor versions could also work, the ones displayed are the one which the tests were done.

#### Installation
1. Download the repository to your machine;
2. Move to the root directory and install the dependencies with `npm install`;
3. Move to the DjangoApp directory and compile the contracts with `truffle compile`;  
a. If you want you can test the contracts with `truffle test`;
5. Run ganache and start a session;
6. Move to the DjangoApp directory and migrate the contracts to the ganache blockchain with `truffle migrate`;
7. Move to the Website/js directory. There are 4 js files that contain the contracts information. In the first line of each, you need to substitute the contract address string with the ones the previous command gave in output;
8. Move to the Website directory and run a local webserver (you can do it with python, with `python3 -m http.server` and access it from browser on port 8000);
9. Enjoy the application!

### Directory structure
+ DjangoApp: where all the backend is located;
  + contracts: contains the solidity contracts developed;
  + migrations: contains the files needed for the migration to ganache/other networks;
  + test: contains the test files;
+ Website: where all the frontend is located;
  + js: javascript files;
  + css: css files for the website style;
