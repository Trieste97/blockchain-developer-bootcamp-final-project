**SWC-103 (Floating pragma)**  
All the written contracts use a spacific compiler version (0.8.2), but not the contracts inherited (the openzeppelin ones);

**SWC-107 (Re-entrancy)**  
The contract functions are already protected from re-entrancy thanks to the checks-effect-interactions pattern, but the functions used for swapping the tokens also have the openzeppelin nonReentrant modifier;

**Pull Over Push**  
Every contract functions that changes the state require a transaction from the user, never the owner (except the pause/unpause ones);

**Checks-Effects-Interactions**  
Every change of state in the contracts happens after the check of requirements and before other contract calls. Most of the checks are already done by the openzeppelin contracts. Examples:
+ deposit function;
+ withdraw function;
+ claim function;

**Use Modifier Only for Validation**  
The modifiers used in the contracts (inherited from openzeppelin) are only for validation, examples:
+ whenNotPaused (from openzeppelin Pausable);
+ nonReentrant (from openzeppelin ReentrancyGuard);
+ onlyRole (from openzeppelin AccessControl);