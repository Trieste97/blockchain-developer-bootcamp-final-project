// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/TokenFaucet.sol";
import "../contracts/DjangoApp.sol";

contract TestDjangoApp {
 	// The address of the DjangoApp contract to be tested
 	TokenFaucet tokenA = TokenFaucet(DeployedAddresses.TokenFaucet());

 	// The id of the pet that will be used for testing
 	uint expectedPetId = 8;

 	// The expected owner of adopted pet is this contract
 	address expectedAdopter = address(this);
}