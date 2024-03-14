const CBDC_Dapps = artifacts.require("CBDC_Dapps");
const DigitalRupiah = artifacts.require("DigitalRupiah");

module.exports = async function (deployer) {
  const CBDC_DappsInstance = await CBDC_Dapps.deployed();
  const BI_Account = await CBDC_DappsInstance.BankIndonesiaAddress();
  await CBDC_DappsInstance.createDigitalRupiah();

  let accounts = await web3.eth.getAccounts();

  const digitalRupiahAddress = await CBDC_DappsInstance.digitalRupiah();
  const DigitalRupiahInstance = await DigitalRupiah.at(digitalRupiahAddress);
  await DigitalRupiahInstance.mint(
    accounts[0],
    web3.utils.toWei("10000000000000", "ether")
  );
};
