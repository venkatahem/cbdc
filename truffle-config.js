const PrivateKeyProvider = require("@truffle/hdwallet-provider");
const mnemonic =
  "hidden logic grass march install hour violin produce success recall whisper limit";

const privateKeyProvider = new PrivateKeyProvider(
  mnemonic,
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
      version: "0.8.11",
    },
  },
  license: "MIT",
};
