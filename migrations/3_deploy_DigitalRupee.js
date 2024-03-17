const CBDC_Dapps = artifacts.require("CBDC_Dapps");
const DigitalRupee = artifacts.require("DigitalRupee");

module.exports = async function (deployer) {
  const CBDC_DappsInstance = await CBDC_Dapps.deployed();
  const BI_Account = await CBDC_DappsInstance.ReserveBankofIndiaAddress();
  await CBDC_DappsInstance.createDigitalRupee();

  let accounts = await web3.eth.getAccounts();

  const digitalRupeeAddress = await CBDC_DappsInstance.digitalRupee();
  const DigitalRupeeInstance = await DigitalRupee.at(digitalRupeeAddress);
  await DigitalRupeeInstance.mint(
    accounts[0],
    web3.utils.toWei("10000000000000", "ether")
  );
};
