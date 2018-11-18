pragma solidity ^0.4.0;

contract Coin {
    // The keyword "public" makes those variables
    // readable from outside.
    address public minter;
    mapping (address => uint) public balances;
    uint32 public value;

    // Events allow light clients to react on
    // changes efficiently.
    event Sent(address from, address to, uint amount);

    // This is the constructor whose code is
    // run only when the contract is created.
    function Coin(uint32 _value) {
        value = _value;
        minter = msg.sender;
    }

    function mint(address _receiver, uint _amount) {
        if (msg.sender != minter) {
            return;
        }
        
        balances[_receiver] += _amount;
    }

    function send(address _receiver, uint _amount) {
        if (balances[msg.sender] < _amount) {
            return;
        }

        balances[msg.sender] -= _amount;
        balances[_receiver] += _amount;
        Sent(msg.sender, _receiver, _amount);
    }
    
    function setValue(uint32 _value) {
        value = _value;
    }
}
