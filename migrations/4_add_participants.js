const CBDC_Dapps = artifacts.require("CBDC_Dapps");
const DigitalRupiah = artifacts.require("DigitalRupiah");

module.exports = async function (deployer) {
  const CBDC_DappsInstance = await CBDC_Dapps.deployed();
  const digitalRupiahAddress = await CBDC_DappsInstance.digitalRupiah();
  const DigitalRupiahInstance = await DigitalRupiah.at(digitalRupiahAddress);

  let accounts = await web3.eth.getAccounts();
  console.log(accounts);

  for (let i = 1; i < 10; i++) {
    await CBDC_DappsInstance.addParticipant(
      accounts[i],
      `Bank ${String.fromCharCode(i - 1 + 65)}`
    );
    await DigitalRupiahInstance.mint(
      accounts[i],
      web3.utils.toWei("10000000000", "ether")
    );
  }
};
