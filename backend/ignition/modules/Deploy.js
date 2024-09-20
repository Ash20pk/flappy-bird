const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const OWNER_ADDRESS = "0x..."; 
const VRF_COORDINATOR = "0x6A2AAd07396B36Fe02a22b33cf443582f682c82f"; 
const SUBSCRIPTION_ID = "1234"; 
const KEY_HASH = "0x..."; 

const FlappyBirdModule = buildModule("FlappyBirdModule", (m) => {
  const implementation = m.contract("FlappyBirdGame");

  const proxy = m.contract("FlappyBirdProxy", [
    implementation,
    m.calldata("initialize", [OWNER_ADDRESS, VRF_COORDINATOR, SUBSCRIPTION_ID, KEY_HASH]),
  ]);

  // This step calls initialize on the implementation contract through the proxy
  m.call(proxy, "initialize", [OWNER_ADDRESS, VRF_COORDINATOR, SUBSCRIPTION_ID, KEY_HASH]);

  return { implementation, proxy };
});

module.exports = FlappyBirdModule;