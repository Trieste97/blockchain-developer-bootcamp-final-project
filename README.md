# DjangoApp - A small DeFi environment simulator
A live Ropsten version of this project is live at https://djangoapp.ddns.net

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
+ TODO url to screen cast


## The technical part

### How to run it locally

#### Requirements
+ TODO tutorial on how to install it and get it to work

#### Installation
+ TODO tutorial on how to install it and get it to work

#### Running
+ TODO tutorial on how to install it and get it to work

### Directory structure
+ TODO describe directory file and structure
