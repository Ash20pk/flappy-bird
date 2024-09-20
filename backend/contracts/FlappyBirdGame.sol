// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BirdGame is ERC721, VRFConsumerBaseV2Plus {
    uint256 private _tokenIdCounter;

    uint256 public s_subscriptionId;
    bytes32 private i_keyHash;
    uint32 private i_callbackGasLimit;
    uint16 private i_requestConfirmations = 3;
    uint32 private i_numWords = 1;

    struct Bird {
        uint256 highScore;
        uint256 xp;
        uint256 level;
        uint256 gameSetupSeed;
        uint256[] pipePositions;
        uint256[] questBoxPositions;
    }

    struct Player {
        uint256 highScore;
        uint256 xp;
        uint256 level;
    }

    mapping(uint256 => Bird) public birds;
    mapping(address => Player) public players;
    mapping(uint256 => uint256) public requestIdToTokenId;

    event GamePlayed(uint256 indexed birdId, uint256 score);
    event LevelUp(uint256 indexed birdId, uint256 newLevel);

    constructor(
        address vrfCoordinatorV2Address,
        uint256 subscriptionId,
        bytes32 keyHash,
        uint32 callbackGasLimit
    ) ERC721("BirdGame", "BIRD") VRFConsumerBaseV2Plus(vrfCoordinatorV2Address) {
        s_subscriptionId = subscriptionId;
        i_keyHash = keyHash;
        i_callbackGasLimit = callbackGasLimit;
        _tokenIdCounter = 0;
    }

    function mintBird(address _to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(_to, tokenId);
        birds[tokenId] = Bird(0, 0, 1, 0, new uint256[](0), new uint256[](0));
        requestRandomWords(tokenId);
    }

    function requestRandomWords(uint256 _tokenId) internal {
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: i_requestConfirmations,
                callbackGasLimit: i_callbackGasLimit,
                numWords: i_numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: false
                    })
                )
            })
        );
        requestIdToTokenId[requestId] = _tokenId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 tokenId = requestIdToTokenId[requestId];
        uint256 seed = randomWords[0];
        birds[tokenId].gameSetupSeed = seed;
        // Generate pipe and quest box positions based on the seed
        birds[tokenId].pipePositions = generatePositions(seed, 5); // Example: 5 pipe positions
        birds[tokenId].questBoxPositions = generatePositions(seed + 1, 3); // Example: 3 quest box positions
    }

    function generatePositions(uint256 seed, uint256 count) internal pure returns (uint256[] memory) {
        uint256[] memory positions = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            positions[i] = uint256(keccak256(abi.encode(seed, i))) % 100; // Example: positions between 0 and 99
        }
        return positions;
    }

    function submitScore(uint256 _birdId, uint256 _score, bytes memory _signature) external {
        require(ownerOf(_birdId) == msg.sender, "Not the owner of the bird");
        require(verifySignature(_birdId, _score, _signature), "Invalid signature");

        Bird storage bird = birds[_birdId];
        Player storage player = players[msg.sender];

        if (_score > bird.highScore) {
            bird.highScore = _score;
            player.highScore = _score;
        }

        uint256 xpGain = _score / 10;
        bird.xp += xpGain;
        player.xp += xpGain;

        uint256 newBirdLevel = calculateLevel(bird.xp);
        if (newBirdLevel > bird.level) {
            bird.level = newBirdLevel;
            emit LevelUp(_birdId, newBirdLevel);
        }

        uint256 newPlayerLevel = calculateLevel(player.xp);
        if (newPlayerLevel > player.level) {
            player.level = newPlayerLevel;
            emit LevelUp(_birdId, newPlayerLevel);
        }

        emit GamePlayed(_birdId, _score);
    }

    function verifySignature(uint256 _birdId, uint256 _score, bytes memory _signature) internal view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(_birdId, _score));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        return recoverSigner(ethSignedMessageHash, _signature) == owner();
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function calculateLevel(uint256 _xp) internal pure returns (uint256) {
        // Example level calculation: level = sqrt(xp / 100)
        return uint256(sqrt(_xp / 100));
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function getBirdStats(uint256 _birdId) external view returns (uint256, uint256, uint256) {
        Bird storage bird = birds[_birdId];
        return (bird.highScore, bird.xp, bird.level);
    }

    function getPlayerStats(address _player) external view returns (uint256, uint256, uint256) {
        Player storage player = players[_player];
        return (player.highScore, player.xp, player.level);
    }

    function getGameSetup(uint256 _birdId) external view returns (uint256, uint256[] memory, uint256[] memory) {
        Bird storage bird = birds[_birdId];
        return (bird.gameSetupSeed, bird.pipePositions, bird.questBoxPositions);
    }

    function getXPForNextLevel(uint256 _currentLevel) external pure returns (uint256) {
        // Example: XP required for next level = (currentLevel + 1) * 100
        return (_currentLevel + 1) * 100;
    }
}