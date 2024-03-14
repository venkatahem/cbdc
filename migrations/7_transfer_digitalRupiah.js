const CBDC_Dapps = artifacts.require("CBDC_Dapps");
const DigitalRupiah = artifacts.require("DigitalRupiah");

module.exports = async function (deployer) {
  const CBDC_DappsInstance = await CBDC_Dapps.deployed();

  let accounts = await web3.eth.getAccounts();

  const digitalRupiahAddress = await CBDC_DappsInstance.digitalRupiah();
  const DigitalRupiahInstance = await DigitalRupiah.at(digitalRupiahAddress);
  await DigitalRupiahInstance.transfer(
    accounts[2],
    web3.utils.toWei("5000000", "ether"),
    { from: accounts[1] }
  );

  await DigitalRupiahInstance.redeem(web3.utils.toWei("1000000", "ether"), {
    from: accounts[1],
  });

  await DigitalRupiahInstance.redeem(web3.utils.toWei("2000000", "ether"), {
    from: accounts[2],
  });

  await DigitalRupiahInstance.transfer(
    accounts[1],
    web3.utils.toWei("5000000", "ether"),
    { from: accounts[2] }
  );

  await DigitalRupiahInstance.redeem(web3.utils.toWei("1000000", "ether"), {
    from: accounts[2],
  });

  await DigitalRupiahInstance.redeem(web3.utils.toWei("2000000", "ether"), {
    from: accounts[1],
  });

  await DigitalRupiahInstance.redeem(web3.utils.toWei("30000000", "ether"), {
    from: accounts[1],
  });

  await DigitalRupiahInstance.redeem(web3.utils.toWei("100000000", "ether"), {
    from: accounts[3],
  });

  await DigitalRupiahInstance.redeem(web3.utils.toWei("350000000", "ether"), {
    from: accounts[3],
  });

  await DigitalRupiahInstance.redeem(web3.utils.toWei("1000000000", "ether"), {
    from: accounts[4],
  });

  await DigitalRupiahInstance.redeem(web3.utils.toWei("500000000", "ether"), {
    from: accounts[2],
  });

  await DigitalRupiahInstance.redeem(web3.utils.toWei("76000000", "ether"), {
    from: accounts[5],
  });

  await DigitalRupiahInstance.transfer(
    accounts[2],
    web3.utils.toWei("10000000", "ether"),
    { from: accounts[1] }
  );
  await DigitalRupiahInstance.transfer(
    accounts[1],
    web3.utils.toWei("10000000", "ether"),
    { from: accounts[2] }
  );

  await DigitalRupiahInstance.transfer(
    accounts[2],
    web3.utils.toWei("100000000", "ether"),
    { from: accounts[1] }
  );
  await DigitalRupiahInstance.transfer(
    accounts[1],
    web3.utils.toWei("100000000", "ether"),
    { from: accounts[2] }
  );
};
