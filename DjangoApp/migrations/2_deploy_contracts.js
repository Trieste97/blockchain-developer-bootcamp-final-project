var TokenFaucet = artifacts.require("TokenFaucet");
var TokenPool = artifacts.require("TokenPool");
var TokenDjango = artifacts.require("TokenDjango");
var DjangoApp = artifacts.require("DjangoApp");

module.exports = async function(deployer) {
    await deployer.deploy(TokenFaucet, "TokenA", "TKA", 1000);
    const tokenA = await TokenFaucet.deployed();

    await deployer.deploy(TokenFaucet, "TokenB", "TKB", 1000);
    const tokenB = await TokenFaucet.deployed();

    await deployer.deploy(TokenPool, "TokenAB", "TKAB");
    const tokenAB = await TokenPool.deployed();

    await deployer.deploy(TokenDjango, "Django", "DJG");
    const tokenDjango = await TokenDjango.deployed();

    await deployer.deploy(
        DjangoApp,
        tokenA.address,
        tokenB.address,
        tokenAB.address,
        tokenDjango.address
    );
}