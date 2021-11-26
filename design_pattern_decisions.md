**Inter-Contract Execution**  
The DjangoApp contract uses the other three contracts functions, examples:
+ to mint the tokens directly to the account (mint function of ERC20 contract);
+ to transfer the token from the account (transferFrom function of ERC20 contract);

**Inheritane and Interfaces**  
All the contracts inherit other openzeppelin contracts:
+ TokenA is ERC20Capped (so there's a limited supply) and AccessControl (to grant a MINTER_ROLE to the DjangoApp contract);
+ TokenB is ERC20Burnable (so the tokens can be burned, usually done by the swapper when doing the TKB -> TKA swap) and AccessControl for the same reason of TokenA;
+ TokenDjango is ERC20 and AccessControl for the same reason of TokenA;
+ DjangoApp is:
    + ReentrancyGuard: it's possible to use the nonReentrant modifier;
    + Ownable: there're some functions that only the owner (creator of the contract) can call;
    + Pausable: the contract can be paused/unpaused by the owner whenever he wants;

**Access Control Design Patterns**  
TokenA, TokenB and TokenDjango inherit the openzeppelin AccessControl contract. This let the owner assign the MINTER_ROLE (used for minting the tokens) to the DjangoApp contract (this is done in the deployment phase).
DjangoApp inherit the openzeppelin Ownable contract. This is for having the pause and unpause functions only callable by the owner.