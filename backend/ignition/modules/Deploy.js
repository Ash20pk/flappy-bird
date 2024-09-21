const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const BirdGameModule = buildModule("BirdGameModule", (m) => {
  const vrfCoordinatorV2Address = "0x5CE8D5A2BC84beb22a398CCA51996F7930313D61";
  const subscriptionId = process.env.SUB_ID;
  const keyHash = "0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be";
  const callbackGasLimit = 2500000;
  const baseURI = "https://silver-blushing-woodpecker-143.mypinata.cloud/ipfs/QmUQN1rrhP2gmNgdnNxppTmCW6zjDTPkt9oaaAhQS6kkbw/";

  const birdGame = m.contract("BirdGame", [
    vrfCoordinatorV2Address,
    subscriptionId,
    keyHash,
    callbackGasLimit,
    baseURI,
  ]);

  return { birdGame };
});

module.exports = BirdGameModule;