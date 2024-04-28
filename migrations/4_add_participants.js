const CBDC_Dapps = artifacts.require("CBDC_Dapps");
const DigitalRupee = artifacts.require("DigitalRupee");

module.exports = async function (deployer) {
  const CBDC_DappsInstance = await CBDC_Dapps.deployed();
  const digitalRupeeAddress = await CBDC_DappsInstance.digitalRupee();
  const DigitalRupeeInstance = await DigitalRupee.at(digitalRupeeAddress);

  let accounts = await web3.eth.getAccounts();

  for (let i = 1; i < 10; i++) {
    if (i <= 5) {
      await CBDC_DappsInstance.addParticipant(
        accounts[i],
        `Bank ${String.fromCharCode(i - 1 + 65)}`
      );
      await DigitalRupeeInstance.mint(
        accounts[i],
        web3.utils.toWei("10000000000", "ether")
      );
    } else {
      await CBDC_DappsInstance.addParticipant(
        accounts[i],
        `User ${String.fromCharCode(i - 6 + 65)}`
      );
      await DigitalRupeeInstance.mint(
        accounts[i],
        web3.utils.toWei("100000", "ether")
      );
    }
  }
};
