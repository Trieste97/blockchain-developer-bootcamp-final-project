const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");
const TokenDjango = artifacts.require("TokenDjango");
const DjangoApp = artifacts.require("DjangoApp");

contract("DjangoApp", async accounts => {
    it("should distribute tokens from faucet", async function() {
        const account = accounts[0];

        const tokenA = await TokenA.deployed();
        const djangoApp = await DjangoApp.deployed();
    
        //tokenA balance before faucet usage
        const account_starting_balance = await tokenA.balanceOf(account);

        // balance should be zero since no txs are done at this point
        assert.equal(account_starting_balance.toString(), 0, "user has not 0 TokenA before faucet usage");

        // execute transaction for receive faucet tokens
        await djangoApp.useFaucet({from: account});

        // tokenA balance after faucet usage
        const account_ending_balance = await tokenA.balanceOf(account);

        // balance after faucet usage should not be 0
        assert.notEqual(account_ending_balance.toString(), 0, "user has 0 tokenA after faucet usage");
    });

    it("should swap tokens and update balances correctly", async function() {
        const account = accounts[0];

        const tokenA = await TokenA.deployed();
        const tokenB = await TokenB.deployed();
        const djangoApp = await DjangoApp.deployed();

        // balances of tokenA and tokenB before the swap
        const account_starting_balanceA = await tokenA.balanceOf(account);
        const account_starting_balanceB = await tokenB.balanceOf(account);

        // the user will swapp all the tokenA he has
        const amount_toSwap = account_starting_balanceA;

        // approve tokenA for swap
        await tokenA.approve(djangoApp.address, amount_toSwap, {from: account});
        
        // swapping all the tokenA the account has
        await djangoApp.swapFaucetTokensForDepositTokens(amount_toSwap, {from: account});

        // balances of tokenA and tokenB after the swap
        const account_ending_balanceA = await tokenA.balanceOf(account);
        const account_ending_balanceB = await tokenB.balanceOf(account);

        // tokenA balance should be 0 because we swapped them all
        assert.equal(account_ending_balanceA.toString(), 0, "user has not 0 tokenA");

        // since the swap ratio is 1:1, tokenB balance should be the tokenB balance before
        // the swap + the tokenA balance before the swap
        const right_account_ending_balanceB = account_starting_balanceB.add(amount_toSwap);
        assert.equal(
            account_ending_balanceB.toString(), 
            right_account_ending_balanceB.toString(), 
            "user has not the right amount of tokenB"
        );
    });

    it("should deposit TKB in the contract", async function() {
        const account = accounts[0];

        const tokenB = await TokenB.deployed();
        const djangoApp = await DjangoApp.deployed();

        // balances of tokenB of the user and the djangoApp contract, before the deposit
        const account_starting_balance = await tokenB.balanceOf(account);
        const contract_starting_balance = await tokenB.balanceOf(djangoApp.address);

        // the user will deposit all the tokenB he has
        const amount_toDeposit = account_starting_balance;

        // approve tokenB for deposit
        await tokenB.approve(djangoApp.address, amount_toDeposit, {from: account});

        // depositing all the tokenB the account has
        await djangoApp.deposit(amount_toDeposit, {from: account});

        // balances of tokenB of the user and the djangoApp contract, after the deposit
        const account_ending_balance = await tokenB.balanceOf(account);
        const contract_ending_balance = await tokenB.balanceOf(djangoApp.address);

        // user should have 0 tokenB because he deposited them all
        assert.equal(account_ending_balance.toString(), 0, "user has not 0 tokenB");

        // contract should have the previous amount + the user deposited one
        const right_contract_ending_balance = contract_starting_balance.add(amount_toDeposit);
        assert.equal(
            contract_ending_balance.toString(), 
            right_contract_ending_balance.toString(), 
            "contract has not the right amount of tokenB"
        );
    });
    
    it("should withdraw TKB from the contract", async function() {
        const account = accounts[0];

        const tokenB = await TokenB.deployed();
        const djangoApp = await DjangoApp.deployed();

        // balances of tokenB of the user and the djangoApp contract, before the withdraw
        const account_starting_balance = await tokenB.balanceOf(account);
        const contract_starting_balance = await tokenB.balanceOf(djangoApp.address);

        // amount of deposited tokenB of the user, before the withdraw
        const account_starting_deposited = await djangoApp.depositedTokens(account);

        // the user will withdraw all the tokens he can
        const amount_toWithdraw = account_starting_deposited;

        // withdrawing all the tokenB the account has
        await djangoApp.withdraw(amount_toWithdraw, {from: account});

        // balances of tokenB of the user and the djangoApp contract, after the withdraw
        const account_ending_balance = await tokenB.balanceOf(account);
        const contract_ending_balance = await tokenB.balanceOf(djangoApp.address);

        // amount of deposited tokenB of the user, after the withdraw
        const account_ending_deposited = await djangoApp.depositedTokens(account);

        // user should have the tokenB from before + the ones withdrawn
        const right_account_ending_balance = account_starting_balance.add(amount_toWithdraw);
        assert.equal(
            account_ending_balance.toString(),
            right_account_ending_balance.toString(),
            "user has not the right amount of tokenB"
        );

        // contract should have the previous amount - the user deposited one
        const right_contract_ending_balance = contract_starting_balance.sub(amount_toWithdraw);
        assert.equal(
            contract_ending_balance.toString(), 
            right_contract_ending_balance.toString(), 
            "contract has not the right amount of tokenB"
        );

        // the user deposited tokens should be 0 now
        assert.equal(account_ending_deposited.toString(), 0, "amount of deposited tokens not right")
    });
    
    it("should mint DJG to user", async function() {
        const account = accounts[0];

        const tokenDjango = await TokenDjango.deployed();
        const djangoApp = await DjangoApp.deployed();

        // balance of tokenDjango of the user before the claim
        const account_starting_balance = await tokenDjango.balanceOf(account);

        // balance should be zero since no claims are done at this point
        assert.equal(account_starting_balance.toString(), 0, "user has not 0 TokenDjango before claim");

        // djangos available to claim
        const account_djangosEarned_beforeClaim = await djangoApp.getDjangoEarned(account);

        // user claims the djangos
        await djangoApp.claim({from: account});

        // balance of tokenDjango of the user after the claim
        const account_ending_balance = await tokenDjango.balanceOf(account);

        // user should have now the claimable djangos
        assert.equal(
            account_ending_balance.toString(),
            account_djangosEarned_beforeClaim.toString(),
            "claim did not succeed correctly"
        );

        // djangos available to claim (after the claim transaction)
        const account_djangosEarned_afterClaim = await djangoApp.getDjangoEarned(account);

        // claimable djangos should be now 0
        assert.equal(account_djangosEarned_afterClaim.toString(), 0, "claimable djangos are not 0");
    });
});
