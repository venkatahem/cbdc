const PrivateKeyProvider = require("@truffle/hdwallet-provider");
const mnemonic =
  "expect ten warrior coconut visual deer jar deny bike canal effort possible";
// const privateKey =
// "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63";
// const privateKeys = [
//   "0xa3b8aebefd10d549a0460a11a5c3d02ef4140ce5bb8ad180fa12096b52a10575",
//   "0x2456ca4e6a47ff8de1ccb3956f4e90c84c2ce3ff0c054ff689c3ed180c2c9b82",
//   "0x1ea61b30d44f27f2505441bb6e81587668db570002cc7a38e83e3a513b8e785d",
//   "0x304279b7909bbdf0ef4c9bdc4ee2f3c39c5b0eafb74f2326879ce7b4a5d29765",
// ];

const privateKeyProvider = new PrivateKeyProvider(
  mnemonic,
  // privateKey,
  "http://localhost:8545"
);

module.exports = {
  mocha: {
    timeout: 3600000,
    // before_timeout: 120000, // Here is 2min but can be whatever timeout is suitable for you.
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
    },

    besu: {
      provider: privateKeyProvider,
      network_id: "*", // Match any network id
    },
  },
  solc: {
    // Turns on the Solidity optimizer. For development the optimizer's
    // quite helpful, just remember to be careful, and potentially turn it
    // off, for live deployment and/or audit time. For more information,
    // see the Truffle 4.0.0 release notes.
    //
    // https://github.com/trufflesuite/truffle/releases/tag/v4.0.0
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  compilers: {
    solc: {
      version: "0.8.18",
    },
  },
  license: "MIT",
};
