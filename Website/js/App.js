App = {
    user: {},
    contracts: {},

    init: async function () {
        // Detect if a wallet is installed
        if (typeof window.ethereum !== 'undefined') {
            console.log("Wallet found")
        } else {
            console.log("No wallet found");

            //TODO say to user he has no wallet
            
            return;
        }

        // contracts initialization
        await App.initContracts();
    },

    initContracts: async function () {
        var web3 = new Web3(window.ethereum);

        const tokenA_contract = new web3.eth.Contract(TokenA_abi, TokenA_address);
        tokenA_contract.setProvider(window.ethereum);
        App.contracts.TokenA = tokenA_contract;

        const tokenB_contract = new web3.eth.Contract(TokenB_abi, TokenB_address);
        tokenB_contract.setProvider(window.ethereum);
        App.contracts.TokenB = tokenB_contract;

        const tokenDjango_contract = new web3.eth.Contract(TokenDjango_abi, TokenDjango_address);
        tokenDjango_contract.setProvider(window.ethereum);
        App.contracts.TokenDjango = tokenDjango_contract;

        const djangoApp_contract = new web3.eth.Contract(DjangoApp_abi, DjangoApp_address);
        djangoApp_contract.setProvider(window.ethereum);
        App.contracts.DjangoApp = djangoApp_contract;

        // DOM event binding to js functions
        return App.bindEvents();
    },

    // bind App events to buttons
    bindEvents: function () {
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

    connectWallet: async function () {
        //TODO switch to correct network

        // request read access to accounts
        try {
            await ethereum.request({ method: 'eth_requestAccounts' })
                .then(async function(accounts) {
                    console.log("Wallet connected: " + accounts[0]);

                    // enabling buttons
                    $("#connect-wallet").text("Wallet connected");
                    $("#use-faucet").attr("disabled",false);
                    $("#swap").attr("disabled",false);
                    $("#claim-djg").attr("disabled",false);
                    $("#deposit-tkb").attr("disabled",false);
                    $("#withdraw-tkb").attr("disabled",false);
                    $("#approve-swap").attr("disabled",false);
                    $("#approve-deposit").attr("disabled",false);
                    $("#claim").attr("disabled",false);

                    // Updating tokens balances
                    await App.loadBalances();
                });
        } catch {
            console.log('Connection rejected');
        }
    },

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
    },

    useFaucet: async function() {
        try {
            await App.contracts.DjangoApp.methods.useFaucet().send({from: ethereum.selectedAddress});
            await App.loadBalances();
        } catch(error) {
            //TODO tell user to connect/wallet or that faucet cooldown not passed
            console.log(error);
        }
    },

    approve: async function(token) {
        var web3 = new Web3(window.ethereum);
        var amount = web3.utils.toWei('10000000000','ether');
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
            //TODO tell him that
            return;
        }

        if (amount_toSwap > userBalance) {
            // user wants to swap an amount larger than his balance
            //TODO tell him that
            return;
        }

        if (amount_toSwap > userAllowance) {
            // user wants to swap an amount larger than his allowance for the contract
            //TODO tell him that
            return;
        }

        var web3 = new Web3(window.ethereum);
        var amount = web3.utils.toWei(amount_toSwap.toString(),'ether');
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

    deposit: async function() {
        let userBalance = App.user.balance_TKB;
        let userAllowance = App.user.allowance_TKB;

        let amount_toDeposit = 0.0;
        amount_toDeposit = parseFloat($('#deposit-or-withdraw-amount').val());
        if (!(amount_toDeposit > 0)) {
            // user did not input a number, or he typed a negative one
            //TODO tell him that
            return;
        }

        if (amount_toDeposit > userBalance) {
            // user wants to swap an amount larger than his balance
            //TODO tell him that
            return;
        }

        if (amount_toDeposit > userAllowance) {
            // user wants to swap an amount larger than his allowance for the contract
            //TODO tell him that
            return;
        }

        var web3 = new Web3(window.ethereum);
        var amount = web3.utils.toWei(amount_toDeposit.toString(),'ether');
        await App.contracts.DjangoApp.methods
            .deposit(amount)
            .send({from:ethereum.selectedAddress})
            .then(function() {
                App.loadBalances();
            });
    },

    withdraw: async function() {
        let depositedTKB = App.user.deposited_TKB;

        let amount_toWithdraw = 0.0;
        amount_toWithdraw = parseFloat($('#deposit-or-withdraw-amount').val());
        console.log(amount_toWithdraw)
        if (!(amount_toWithdraw > 0)) {
            // user did not input a number, or he typed a negative one
            //TODO tell him that
            return;
        }

        if (amount_toWithdraw > depositedTKB) {
            // user wants to swap an amount larger than his balance
            //TODO tell him that
            return;
        }

        var web3 = new Web3(window.ethereum);
        var amount = web3.utils.toWei(amount_toWithdraw.toString(),'ether');
        await App.contracts.DjangoApp.methods
            .withdraw(amount)
            .send({from:ethereum.selectedAddress})
            .then(function() {
                App.loadBalances();
            });
    },

    claim: async function() {
        var web3 = new Web3(window.ethereum);
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

