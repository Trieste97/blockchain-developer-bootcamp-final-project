App = {
    user: {},
    contracts: {},
    web3: null,

    init: async function () {
        // Detect if a wallet is installed
        if (typeof window.ethereum !== 'undefined') {
            console.log("Wallet found")
        } else {
            console.log("No wallet found");

            alert("No wallet found, please install one and reload!");
            return;
        }

        await App.initContracts();
    },

    // contracts initialization
    initContracts: async function () {
        App.web3 = new Web3(window.ethereum);

        const tokenA_contract = new App.web3.eth.Contract(TokenA_abi, TokenA_address);
        tokenA_contract.setProvider(window.ethereum);
        App.contracts.TokenA = tokenA_contract;

        const tokenB_contract = new App.web3.eth.Contract(TokenB_abi, TokenB_address);
        tokenB_contract.setProvider(window.ethereum);
        App.contracts.TokenB = tokenB_contract;

        const tokenDjango_contract = new App.web3.eth.Contract(TokenDjango_abi, TokenDjango_address);
        tokenDjango_contract.setProvider(window.ethereum);
        App.contracts.TokenDjango = tokenDjango_contract;

        const djangoApp_contract = new App.web3.eth.Contract(DjangoApp_abi, DjangoApp_address);
        djangoApp_contract.setProvider(window.ethereum);
        App.contracts.DjangoApp = djangoApp_contract;

        return App.bindEvents();
    },

    // events binding to js functions
    bindEvents: function () {
        window.ethereum.on('chainChanged', function(chainID) {
            let newChainID = App.web3.utils.hexToNumberString(chainID);
            console.log("Changed chain ID to :" + newChainID);
            if (newChainID != '3' && newChainID != '1337') {
                location.reload();
            }
        });

        $(document).on('click','#connect-wallet', App.connectWallet);
        $(document).on('click','#use-faucet',App.useFaucet);
        $(document).on('click','#swap',App.swap);
        $(document).on('click','#approve-deposit', function() {
            App.approve("TKB");
        });
        $(document).on('click','#deposit-tkb',App.deposit);
        $(document).on('click','#withdraw-tkb',App.withdraw);
        $(document).on('click','#claim',App.claim);
    },

    // user connects wallet
    connectWallet: async function () {
        // request read access to accounts
        try {
            await ethereum.request({ method: 'eth_requestAccounts' })
                .then(async function(accounts) {
                    console.log("Wallet connected: " + accounts[0]);

                    //check network
                    let currentChain = App.web3.utils.hexToNumberString(ethereum.chainId);
                    if (currentChain != '3' && currentChain != '1337') {
                        console.log("Connected to wrong network");
                        alert("Wrong network, please switch to Ropsten or Ganache and retry!");
                    } else {
                        // enabling buttons if network is correct
                        $("#connect-wallet").text("Wallet connected");
                        $("#use-faucet").attr("disabled",false);
                        $("#swap").attr("disabled",false);
                        $("#claim-djg").attr("disabled",false);
                        $("#deposit-tkb").attr("disabled",false);
                        $("#withdraw-tkb").attr("disabled",false);
                        $("#approve-swap").attr("disabled",false);
                        $("#approve-deposit").attr("disabled",false);
                        $("#claim").attr("disabled",false);
                    }

                    // Updating tokens balances
                    await App.loadBalances();
                });
        } catch {
            console.log('Some problem happened connecting wallet');
        }
    },

    // update of DApp tokens balances and other user info
    loadBalances: async function() {
        await App.contracts.TokenA.methods.balanceOf(ethereum.selectedAddress).call().then(function(balance) {
            $("#tka-balance").text(balance / Math.pow(10,18));
            App.user.balance_TKA = balance / Math.pow(10,18);
        });
        await App.contracts.TokenB.methods.balanceOf(ethereum.selectedAddress).call().then(function(balance) {
            $("#tkb-balance").text(balance / Math.pow(10,18));
            App.user.balance_TKB = balance / Math.pow(10,18);
        });
        await App.contracts.TokenDjango.methods.balanceOf(ethereum.selectedAddress).call().then(function(balance) {
            $("#djg-balance").text(balance / Math.pow(10,18));
            App.user.balance_DJG = balance / Math.pow(10,18);
        });
        await App.contracts.DjangoApp.methods.depositedTokens(ethereum.selectedAddress).call().then(function(balance) {
            $("#deposited-tkb").text(balance / Math.pow(10,18));
            App.user.deposited_TKB = balance / Math.pow(10,18);
        });
        await App.contracts.DjangoApp.methods.getDjangoEarned(ethereum.selectedAddress).call().then(function(balance) {
            $("#claim-balance").text(balance / Math.pow(10,18));
            App.user.claimable_DJG = balance / Math.pow(10,18);
        });
        await App.contracts.TokenA.methods.allowance(
            ethereum.selectedAddress,
            App.contracts.DjangoApp._address
        ).call().then(function(allowance) {
            App.user.allowance_TKA = allowance / Math.pow(10,18);
        });
        await App.contracts.TokenB.methods.allowance(
            ethereum.selectedAddress,
            App.contracts.DjangoApp._address
        ).call().then(function(allowance) {
            App.user.allowance_TKB = allowance / Math.pow(10,18);
        });
        await App.contracts.DjangoApp.methods.lastTimeUsedFaucet(
            ethereum.selectedAddress
        ).call().then(function(lastTimeFaucet) {
            App.user.lastTimeFaucet = lastTimeFaucet;
        });
    },

    // user uses faucet
    useFaucet: async function() {
        try {
            // check if 24h passed since last usage
            let secondsFromEpoch = Math.round(Date.now() / 1000);
            let secondsLastFaucet = parseInt(App.user.lastTimeFaucet);
            let secondsLeftForFaucet = (secondsLastFaucet + (24 * 60 * 60)) - secondsFromEpoch;
            if (secondsLeftForFaucet < 0) {
                await App.contracts.DjangoApp.methods.useFaucet().send({from: ethereum.selectedAddress});
                await App.loadBalances();
            } else {
                alert("Faucet is still in cooldown for this account, resetting in " + Math.round(secondsLeftForFaucet/3600) + " hours");
            }
        } catch(error) {
            console.log(error);
        }
    },

    // user approves token (TKA or TKB)
    approve: async function(token) {
        //approving to max
        var BN = App.web3.utils.BN;
        let amount = new BN(App.web3.utils.hexToNumberString('0x' + 'f'.repeat(64))).toString();
        if (token == "TKA") {
            await App.contracts.TokenA.methods
            .approve(App.contracts.DjangoApp._address, amount)
            .send({from: ethereum.selectedAddress});
        } else {
            await App.contracts.TokenB.methods
            .approve(App.contracts.DjangoApp._address, amount)
            .send({from: ethereum.selectedAddress});
        }
        await App.loadBalances();
    },

    // user swaps TKA for TKB or viceversa
    swap: async function() {
        let tka_to_tkb = true;
        let userBalance = App.user.balance_TKA;
        let userAllowance = App.user.allowance_TKA;
        if ($('#token-to-swap').text() == "TKB → TKA") {
            tka_to_tkb = false;
            userBalance = App.user.balance_TKB;
            userAllowance = App.user.allowance_TKA;
        }

        let amount_toSwap = 0.0;
        amount_toSwap = parseFloat($('#swap-amount').val());
        if (!(amount_toSwap > 0)) {
            // user did not input a number, or he typed a negative one
            alert("Input amount not valid!");
            return;
        }

        if (amount_toSwap > userBalance) {
            // user wants to swap an amount larger than his balance
            alert("Not enough balance to swap!");
            return;
        }

        if (amount_toSwap > userAllowance) {
            // user wants to swap an amount larger than his allowance for the contract
            alert("Not enough allowance, please approve first!")
            return;
        }

        var amount = App.web3.utils.toWei(amount_toSwap.toString(),'ether');
        if (tka_to_tkb) {
            await App.contracts.DjangoApp.methods
            .swapFaucetTokensForDepositTokens(amount)
            .send({from:ethereum.selectedAddress})
            .then(function() {
                App.loadBalances();
            });
        } else {
            await App.contracts.DjangoApp.methods
            .swapDepositTokensForFaucetTokens(amount)
            .send({from:ethereum.selectedAddress})
            .then(function() {
                App.loadBalances();
            });
        }        
    },

    // user deposits TKB in the contract
    deposit: async function() {
        let userBalance = App.user.balance_TKB;
        let userAllowance = App.user.allowance_TKB;

        let amount_toDeposit = 0.0;
        amount_toDeposit = parseFloat($('#deposit-or-withdraw-amount').val());
        if (!(amount_toDeposit > 0)) {
            // user did not input a number, or he typed a negative one
            alert("Input amount not valid!");
            return;
        }

        if (amount_toDeposit > userBalance) {
            // user wants to swap an amount larger than his balance
            alert("Not enough balance to swap!");
            return;
        }

        if (amount_toDeposit > userAllowance) {
            // user wants to swap an amount larger than his allowance for the contract
            alert("Not enough allowance, please approve first!");
            return;
        }

        var amount = App.web3.utils.toWei(amount_toDeposit.toString(),'ether');
        await App.contracts.DjangoApp.methods
            .deposit(amount)
            .send({from:ethereum.selectedAddress})
            .then(function() {
                App.loadBalances();
            });
    },

    // user withdraws TKB from the contract
    withdraw: async function() {
        let depositedTKB = App.user.deposited_TKB;

        let amount_toWithdraw = 0.0;
        amount_toWithdraw = parseFloat($('#deposit-or-withdraw-amount').val());
        if (!(amount_toWithdraw > 0)) {
            // user did not input a number, or he typed a negative one
            alert("Input amount not valid!");
            return;
        }

        if (amount_toWithdraw > depositedTKB) {
            // user wants to swap an amount larger than his balance
            alert("Not enough balance to swap!");
            return;
        }

        var amount = App.web3.utils.toWei(amount_toWithdraw.toString(),'ether');
        await App.contracts.DjangoApp.methods
            .withdraw(amount)
            .send({from:ethereum.selectedAddress})
            .then(function() {
                App.loadBalances();
            });
    },

    // user claims DJG (if any)
    claim: async function() {
        await App.contracts.DjangoApp.methods
            .claim()
            .send({from:ethereum.selectedAddress})
            .then(function() {
                App.loadBalances();
            });
    }
};

$(window).load(function () {
    App.init();

    // bidding web interface functions
    $(document).on("click", "#token-to-swap", changeSwapToken);
    $(document).on('click', '#approve-swap', approveSwap);
});

function changeSwapToken() {
    if ($('#token-to-swap').text() == "TKA → TKB") {
        $('#token-to-swap').text("TKB → TKA");
    } else {
        $('#token-to-swap').text("TKA → TKB");
    }
}

function approveSwap() {
    if ($('#token-to-swap').text() == "TKA → TKB") {
        App.approve("TKA");
    } else {
        App.approve("TKB");
    }
}