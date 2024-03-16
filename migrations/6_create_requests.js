const CBDC_Dapps = artifacts.require("CBDC_Dapps");
const DigitalRupee = artifacts.require("DigitalRupee");
const SBN = artifacts.require("SBN");
const Request = artifacts.require("Request");

module.exports = async function (deployer) {
  const CBDC_DappsInstance = await CBDC_Dapps.deployed();
  const digitalRupeeAddress = await CBDC_DappsInstance.digitalRupee();
  const DigitalRupeeInstance = await DigitalRupee.at(digitalRupeeAddress);

  const accounts = await web3.eth.getAccounts();

  const sbn = await CBDC_DappsInstance.getSbnAddresses();

  const latestBlock = await web3.eth.getBlock("latest");

  const today = latestBlock.timestamp;
  const todayExactHour = today - (today % 3600);

  //   function createSellRequest(){
  //     address _SBN,
  //     address _buyer,
  //     uint256 _sbnAmount,
  //     uint256 _rupeeAmount,
  //     uint256 _expiredDate
  // };
  // sell 100 unit of SBR010 from accounts[1] (Bank Mandiri) to accounts[2] (Bank BCA) for a total of Rp105.000.000. The seller does not approve their SBN yet
  await CBDC_DappsInstance.createSellRequest(
    sbn[0],
    accounts[2],
    100,
    web3.utils.toWei("105000000", "ether"),
    todayExactHour + 3600 * 24,
    { from: accounts[1] }
  );
  await CBDC_DappsInstance.createSellRequest(
    sbn[0],
    accounts[2],
    100,
    web3.utils.toWei("105000000", "ether"),
    todayExactHour + 3600 * 10,
    { from: accounts[1] }
  );

  await CBDC_DappsInstance.createSellRequest(
    sbn[3],
    accounts[3],
    1000,
    web3.utils.toWei("1060000000", "ether"),
    todayExactHour + 3600 * 15,
    { from: accounts[1] }
  );

  await CBDC_DappsInstance.createSellRequest(
    sbn[3],
    accounts[4],
    2000,
    web3.utils.toWei("2100000000", "ether"),
    todayExactHour + 3600 * 14,
    { from: accounts[1] }
  );

  await CBDC_DappsInstance.createSellRequest(
    sbn[1],
    accounts[5],
    500,
    web3.utils.toWei("522500000", "ether"),
    todayExactHour + 3600 * 17,
    { from: accounts[1] }
  );

  // sell 200 unit of SR015 from accounts[1] (Bank Mandiri) to accounts[2] (Bank BCA) for a total of Rp206.000.000. The seller does not approve their SBN yet
  await CBDC_DappsInstance.createSellRequest(
    sbn[1],
    accounts[2],
    200,
    web3.utils.toWei("206000000", "ether"),
    todayExactHour + 3600 * 13,
    { from: accounts[1] }
  );

  // sell 1000 unit of SR015 from accounts[2] (Bank BCA) to accounts[1] (Bank Mandiri) for a total of Rp1.030.000.000. The seller does not approve their SBN yet
  await CBDC_DappsInstance.createSellRequest(
    sbn[1],
    accounts[1],
    1000,
    web3.utils.toWei("1030000000", "ether"),
    todayExactHour + 3600 * 24,
    { from: accounts[2] }
  );

  await CBDC_DappsInstance.createSellRequest(
    sbn[2],
    accounts[1],
    2000,
    web3.utils.toWei("2100000000", "ether"),
    todayExactHour + 3600 * 12,
    { from: accounts[2] }
  );

  await CBDC_DappsInstance.createSellRequest(
    sbn[2],
    accounts[1],
    300,
    web3.utils.toWei("313500000", "ether"),
    todayExactHour + 3600 * 23,
    { from: accounts[3] }
  );

  await CBDC_DappsInstance.createSellRequest(
    sbn[3],
    accounts[1],
    2000,
    web3.utils.toWei("2700000000", "ether"),
    todayExactHour + 3600 * 14,
    { from: accounts[4] }
  );

  await CBDC_DappsInstance.createSellRequest(
    sbn[0],
    accounts[1],
    500,
    web3.utils.toWei("522500000", "ether"),
    todayExactHour + 3600 * 17,
    { from: accounts[5] }
  );

  // sell 200 unit of SR015 from accounts[1] (Bank Mandiri) to accounts[2] (Bank BCA) for a total of Rp206.000.000. The seller does not approve their SBN yet
  await CBDC_DappsInstance.createSellRequest(
    sbn[1],
    accounts[1],
    200,
    web3.utils.toWei("206000000", "ether"),
    todayExactHour + 3600 * 13,
    { from: accounts[2] }
  );

  // await sbn_1.approve(requestAddress1, 100, { from: accounts[1] });

  // await CBDC_DappsInstance.createSellRequest(
  //   sbn[1],
  //   accounts[1],
  //   1000,
  //   web3.utils.toWei("1030000000", "ether"),
  //   latestBlock.timestamp + 60 * 3,
  //   { from: accounts[2] }
  // );
};
