var TokenA = artifacts.require("TokenA");
var TokenB = artifacts.require("TokenB");
var TokenDjango = artifacts.require("TokenDjango");
var DjangoApp = artifacts.require("DjangoApp");

module.exports = async function(deployer) {
    await deployer.deploy(TokenA);
    const tokenA = await TokenA.deployed();

    await deployer.deploy(TokenB);
    const tokenB = await TokenB.deployed();

    await deployer.deploy(TokenDjango);
    const tokenDjango = await TokenDjango.deployed();

    await deployer.deploy(
        DjangoApp,
        tokenA.address,
        tokenB.address,
        tokenDjango.address
    );
    const djangoApp = await DjangoApp.deployed();

    const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
    await tokenA.grantRole(MINTER_ROLE, djangoApp.address);
    await tokenB.grantRole(MINTER_ROLE, djangoApp.address);
    await tokenDjango.grantRole(MINTER_ROLE, djangoApp.address);
}