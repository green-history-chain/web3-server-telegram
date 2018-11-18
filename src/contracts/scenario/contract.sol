pragma solidity ^0.4.14;

// Contract for storing legal Scenario's on the blockchain
//
// Author: Ben Rogmans
//
contract Scenario {

    bytes32 public name;
    uint    public lastVersion;
    address public creator;

    mapping(uint => Version) public versions;

    struct Version
    {
        uint effectiveDate;
        string content;
    }

    // require msg.sender == publisher
    modifier creatorOnly {
        if(msg.sender != creator) {
            revert();
        } else {
            _;
        }
    }
    
    // Create the contract
    function Scenario(bytes32 _name) public {
        name        = _name;
        creator     = msg.sender;
    }
    
    // Publish a new Scenario
    function publishScenarioVersion(uint _effectiveDate, string _content) creatorOnly public {
        
        // Only newer versions can be published
        if(_effectiveDate <= lastVersion) revert();
        
        versions[_effectiveDate] = Version({
            effectiveDate:  _effectiveDate,
            content:        _content
        });
        
        lastVersion = _effectiveDate;
    }
    
    function getScenario(uint _version) public constant returns(string) {
        return(versions[_version].content);
    }
}