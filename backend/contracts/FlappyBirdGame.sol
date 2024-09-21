// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BirdGame is ERC721, ERC721URIStorage, ERC721Enumerable, VRFConsumerBaseV2Plus {
    uint256 private _tokenIdCounter;
    uint256 public _gameIdCounter;
    uint256 public _gameHistoryCounter;

    uint256 public s_subscriptionId;
    bytes32 private i_keyHash;
    uint32 private i_callbackGasLimit;
    uint16 private i_requestConfirmations = 3;
    uint32 private i_numWords = 1;

    string private _baseTokenURI;

    enum RequestType { Mint, GameSetup }

    struct Bird {
        uint256 highScore;
        uint256 xp;
        uint256 level;
        uint256 imageId;
    }

    struct Game {
        uint256 gameSetupSeed;
        uint256[] pipePositions;
        uint256[] questBoxPositions;
    }

    struct Player {
        string name;
        uint256 highScore;
        uint256 xp;
        uint256 level;
        uint256[] ownedBirds;
        bool isRegistered;
    }

    struct PendingRequest {
        RequestType requestType;
        address to;
    }

    struct GameHistory {
        uint256 birdId;
        uint256 gameId;
        uint256 score;
        uint256 xpEarned;
        uint256 timestamp;
    }

    mapping(uint256 => Bird) public birds;
    mapping(uint256 => Game) public games;
    mapping(address => Player) public players;
    mapping(uint256 => PendingRequest) public pendingRequests;
    mapping(uint256 => GameHistory) public gameHistories;


    event GamePlayed(uint256 indexed birdId, uint256 gameId, uint256 score, uint256 xpEarned);
    event LevelUp(uint256 indexed birdId, uint256 newLevel);
    event PlayerRegistered(address indexed playerAddress, string name);
    event BirdMinted(address indexed owner, uint256 indexed tokenId, uint256 imageId);
    event GameSetupGenerated(uint256 indexed tokenId, uint256 gameSetupSeed);

    constructor(
        address vrfCoordinatorV2Address,
        uint256 subscriptionId,
        bytes32 keyHash,
        uint32 callbackGasLimit,
        string memory baseURI
    ) ERC721("BirdGame", "BIRD") VRFConsumerBaseV2Plus(vrfCoordinatorV2Address) {
        s_subscriptionId = subscriptionId;
        i_keyHash = keyHash;
        i_callbackGasLimit = callbackGasLimit;
        _tokenIdCounter = 0;
        _gameIdCounter = 0;
        _gameHistoryCounter = 0;
        _baseTokenURI = baseURI;
    }

    function registerPlayer(string memory _name) external {
        require(!players[msg.sender].isRegistered, "Player already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");

        players[msg.sender] = Player({
            name: _name,
            highScore: 0,
            xp: 0,
            level: 1,
            ownedBirds: new uint256[](0),
            isRegistered: true
        });

        emit PlayerRegistered(msg.sender, _name);
    }

    
    function mintBird(address _to) external onlyOwner {
        require(players[_to].isRegistered, "Player must be registered to receive a bird");

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

        pendingRequests[requestId] = PendingRequest(RequestType.Mint, _to);

    }

    function playGame(address _to) external {
        require(players[_to].isRegistered, "Player must be registered to receive a bird");

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

        pendingRequests[requestId] = PendingRequest(RequestType.GameSetup, _to);
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyOwner {
        _setTokenURI(tokenId, _tokenURI);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        PendingRequest memory request = pendingRequests[requestId];
        
        if (request.requestType == RequestType.Mint) {
            uint256 imageId = (randomWords[0] % 3) + 1;

            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;

            _safeMint(request.to, tokenId);
            birds[tokenId] = Bird(0, 0, 1, imageId);
            
            players[request.to].ownedBirds.push(tokenId);
            
            _setTokenURI(tokenId, string(abi.encodePacked(uint256ToString(imageId), ".json")));

            emit BirdMinted(request.to, tokenId, imageId);

        } else if (request.requestType == RequestType.GameSetup) {
            uint256 gameId = _gameIdCounter;
            _gameIdCounter++;
            uint256 seed = randomWords[0];
            games[gameId].gameSetupSeed = seed;
            games[gameId].pipePositions = generatePositions(seed, 5);
            games[gameId].questBoxPositions = generatePositions(seed + 1, 3);

            emit GameSetupGenerated(gameId, seed);
        }

        delete pendingRequests[requestId];
    }

    function generatePositions(uint256 seed, uint256 count) internal pure returns (uint256[] memory) {
        uint256[] memory positions = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            positions[i] = uint256(keccak256(abi.encode(seed, i))) % 100; // Example: positions between 0 and 99
        }
        return positions;
    }

    function submitScore(uint256 _birdId, uint256 _gameId, uint256 _score, bytes memory _signature) external {
        require(ownerOf(_birdId) == msg.sender, "Not the owner of the bird");
        require(verifySignature(_birdId, _gameId, _score, _signature), "Invalid signature");
        require(players[msg.sender].isRegistered, "Player not registered");

        Bird storage bird = birds[_birdId];
        Player storage player = players[msg.sender];

        if (_score > bird.highScore) {
            bird.highScore = _score;
        }
        if (_score > player.highScore) {
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

        // Record game history
        uint256 gameHistoryId = _gameHistoryCounter;
        _gameHistoryCounter++;
        gameHistories[gameHistoryId] = GameHistory({
            birdId: _birdId,
            gameId: _gameId,
            score: _score,
            xpEarned: xpGain,
            timestamp: block.timestamp
        });

        emit GamePlayed(_birdId, _gameId, _score, xpGain);
    }

    function verifySignature(uint256 _birdId, uint256 _gameId, uint256 _score, bytes memory _signature) internal view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(_birdId, _gameId, _score));
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

    function uint256ToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function getBirdStats(uint256 _birdId) external view returns (uint256, uint256, uint256) {
        Bird storage bird = birds[_birdId];
        return (bird.highScore, bird.xp, bird.level);
    }

    function getGameSetup(uint256 _gameId) external view returns (uint256, uint256[] memory, uint256[] memory) {
        Game storage game = games[_gameId];
        return (game.gameSetupSeed, game.pipePositions, game.questBoxPositions);
    }

    function getXPForNextLevel(uint256 _currentLevel) external pure returns (uint256) {
        // Example: XP required for next level = (currentLevel + 1) * 100
        return (_currentLevel + 1) * 100;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function getPlayerStats(address _player) external view returns (string memory, uint256, uint256, uint256, bool, uint256[] memory) {
        Player storage player = players[_player];
        return (player.name, player.highScore, player.xp, player.level, player.isRegistered, player.ownedBirds);
    }

    function getPlayerOwnedBirds(address _player) external view returns (uint256[] memory) {
        return players[_player].ownedBirds;
    }

    function currentGameId() external view returns (uint256) {
        return _gameIdCounter;
    }

    function getGameHistory(uint256 _gameHistoryId) external view returns (uint256, uint256, uint256, uint256, uint256) {
        GameHistory storage history = gameHistories[_gameHistoryId];
        return (history.birdId, history.gameId, history.score, history.xpEarned, history.timestamp);
    }

    function getPlayerGameHistories(address _player) external view returns (uint256[] memory) {
        uint256[] memory playerHistories = new uint256[](_gameHistoryCounter);
        uint256 count = 0;
        for (uint256 i = 0; i < _gameHistoryCounter; i++) {
            if (ownerOf(gameHistories[i].birdId) == _player) {
                playerHistories[count] = i;
                count++;
            }
        }
        // Resize the array to remove empty slots
        assembly {
            mstore(playerHistories, count)
        }
        return playerHistories;
    }

    //Function Overrides
    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721, ERC721Enumerable) returns (address) {
        address from = super._update(to, tokenId, auth);

        // Handle removal from 'from' player's ownedBirds (if it's not a mint)
        if (from != address(0)) {
            Player storage fromPlayer = players[from];
            for (uint i = 0; i < fromPlayer.ownedBirds.length; i++) {
                if (fromPlayer.ownedBirds[i] == tokenId) {
                    fromPlayer.ownedBirds[i] = fromPlayer.ownedBirds[fromPlayer.ownedBirds.length - 1];
                    fromPlayer.ownedBirds.pop();
                    break;
                }
            }
        }

        // Handle addition to 'to' player's ownedBirds (if it's not a burn)
        if (to != address(0)) {
            players[to].ownedBirds.push(tokenId);
        }

        return from;
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, uint256ToString(tokenId), ".json")) : "";
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}