const CBDC_Dapps = artifacts.require("CBDC_Dapps");
const SBN = artifacts.require("SBN");

module.exports = async function (deployer) {
  const CBDC_DappsInstance = await CBDC_Dapps.deployed();

  let accounts = await web3.eth.getAccounts();

  //   string memory _name,
  //   string memory _symbol,
  //   uint256 _initialUnitPrice,
  //   uint256 _releasedDate,
  //   uint256 _maturityDate

  await CBDC_DappsInstance.createSBN(
    "Savings Bond Ritel 010",
    "SBR010",
    web3.utils.toWei("1000000", "ether"),
    1626886800, //22 Juli 2021
    1688922000 //10 Juli 2023
  );

  await CBDC_DappsInstance.createSBN(
    "Sukuk Ritel 015",
    "SR015",
    web3.utils.toWei("1000000", "ether"),
    1632243600, //22 September 2021
    1725901200 //10 September 2024
  );

  await CBDC_DappsInstance.createSBN(
    "Sukuk Tabungan 008",
    "ST008",
    web3.utils.toWei("1000000", "ether"),
    1637686800, //24 November 2021
    1699549200 //10 November 2023
  );

  await CBDC_DappsInstance.createSBN(
    "Obligasi Negara Ritel 020",
    "ORI020",
    web3.utils.toWei("1000000", "ether"),
    1635267600, //27 Oktober 2021
    1728925200 //15 Oktober 2024
  );

  const sbn = await CBDC_DappsInstance.getSbnAddresses();
  //   console.log(sbn[0]);

  const sbn_1 = await SBN.at(sbn[0]);
  const sbn_2 = await SBN.at(sbn[1]);
  const sbn_3 = await SBN.at(sbn[2]);
  const sbn_4 = await SBN.at(sbn[3]);

  await sbn_1.mint(accounts[1], "100000");
  await sbn_2.mint(accounts[1], "120000");
  await sbn_3.mint(accounts[1], "200000");
  await sbn_4.mint(accounts[1], "50000");

  await sbn_1.mint(accounts[0], "100000");
  await sbn_2.mint(accounts[0], "100000");
  await sbn_3.mint(accounts[0], "100000");
  await sbn_4.mint(accounts[0], "100000");

  await sbn_1.mint(accounts[2], "300000");
  await sbn_2.mint(accounts[2], "400000");
  await sbn_3.mint(accounts[2], "500000");

  await sbn_1.mint(accounts[3], "100000");
  await sbn_2.mint(accounts[3], "120000");
  await sbn_3.mint(accounts[3], "200000");
  await sbn_4.mint(accounts[3], "50000");

  await sbn_1.mint(accounts[4], "100000");
  await sbn_2.mint(accounts[4], "120000");
  await sbn_3.mint(accounts[4], "200000");
  await sbn_4.mint(accounts[4], "50000");

  await sbn_1.mint(accounts[5], "100000");
  await sbn_2.mint(accounts[5], "120000");
  await sbn_3.mint(accounts[5], "200000");
  await sbn_4.mint(accounts[5], "50000");
};
