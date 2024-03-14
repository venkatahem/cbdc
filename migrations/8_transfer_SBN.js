const CBDC_Dapps = artifacts.require("CBDC_Dapps");
const SBN = artifacts.require("SBN");

module.exports = async function (deployer) {
  const CBDC_DappsInstance = await CBDC_Dapps.deployed();

  let accounts = await web3.eth.getAccounts();

  const sbn = await CBDC_DappsInstance.getSbnAddresses();

  const sbn_1 = await SBN.at(sbn[0]);
  const sbn_2 = await SBN.at(sbn[1]);
  const sbn_3 = await SBN.at(sbn[2]);
  const sbn_4 = await SBN.at(sbn[3]);

  await sbn_1.transfer(accounts[2], 100, { from: accounts[1] });

  await sbn_1.redeem(1000, {
    from: accounts[1],
  });

  await sbn_1.redeem(500, {
    from: accounts[2],
  });

  await sbn_1.redeem(1000, {
    from: accounts[3],
  });

  await sbn_1.redeem(2000, {
    from: accounts[1],
  });

  await sbn_1.redeem(900, {
    from: accounts[4],
  });

  await sbn_1.redeem(3000, {
    from: accounts[5],
  });

  await sbn_1.redeem(500, {
    from: accounts[2],
  });

  await sbn_1.redeem(1000, {
    from: accounts[1],
  });

  await sbn_1.transfer(accounts[1], 1000, { from: accounts[2] });

  await sbn_2.redeem(500, {
    from: accounts[2],
  });

  await sbn_2.redeem(500, {
    from: accounts[1],
  });

  await sbn_2.transfer(accounts[2], 100, { from: accounts[1] });
  await sbn_2.transfer(accounts[1], 200, { from: accounts[2] });

  await sbn_2.transfer(accounts[2], 1500, {
    from: accounts[1],
  });
  await sbn_2.transfer(accounts[1], 750, {
    from: accounts[2],
  });
};
