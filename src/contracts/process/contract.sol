pragma solidity ^0.4.14;
// Contract facilitating a legal process on the blockchain
//
// Author: Ben Rogmans
//
contract Process {
    
    Scenario public scenario;
    string[] public keys;
    string[] public events;
    
    function Process(Scenario _scenario) public {
        scenario = _scenario;
    }
    
    function addKey(string _key) public {
        keys.push(_key);
    }
    
    function addEvent(string _event) public {
        events.push(_event);
    }
    
    function getKeySize() public constant returns(uint) {
        return keys.length;
    }
    
    function getEventSize() public constant returns(uint) {
        return events.length;
    }
}