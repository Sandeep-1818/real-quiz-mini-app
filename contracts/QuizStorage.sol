// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract QuizStorage {
    struct QuizResult {
        address player;
        uint8 score;
        uint256 timestamp;
    }
    
    QuizResult[] public allResults;
    mapping(address => QuizResult[]) public playerResults;
    
    event QuizSubmitted(address indexed player, uint8 score, uint256 timestamp);
    
    function submitQuiz(uint8 _score) public {
        require(_score <= 5, "Score must be between 0 and 5");
        
        QuizResult memory result = QuizResult({
            player: msg.sender,
            score: _score,
            timestamp: block.timestamp
        });
        
        allResults.push(result);
        playerResults[msg.sender].push(result);
        
        emit QuizSubmitted(msg.sender, _score, block.timestamp);
    }
    
    function getPlayerResults(address _player) public view returns (QuizResult[] memory) {
        return playerResults[_player];
    }
    
    function getTotalSubmissions() public view returns (uint256) {
        return allResults.length;
    }
}
