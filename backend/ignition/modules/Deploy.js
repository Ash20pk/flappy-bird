const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const BirdGameModule = buildModule("BirdGameModule", (m) => {
  const vrfCoordinatorV2Address = "0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2";
  const subscriptionId = process.env.SUB_ID;
  const keyHash = "0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899";
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