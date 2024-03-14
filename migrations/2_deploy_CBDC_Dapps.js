const CBDC_Dapps = artifacts.require("CBDC_Dapps");

module.exports = function (deployer) {
  deployer.deploy(CBDC_Dapps);
};
