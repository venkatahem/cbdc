const CBDC_Dapps = artifacts.require("CBDC_Dapps");
const DigitalRupiah = artifacts.require("DigitalRupiah");

contract("CBDC_Dapps", function (accounts) {
  it("create 10 digital rupiah transfer", async () => {
    const CBDC_DappsInstance = await CBDC_Dapps.deployed();

    const digitalRupiahAddress = await CBDC_DappsInstance.digitalRupiah();
    const DigitalRupiahInstance = await DigitalRupiah.at(digitalRupiahAddress);

    await DigitalRupiahInstance.mint(
      accounts[0],
      web3.utils.toWei("10000000000", "ether")
    );

    const promises = [];

    for (let i = 0; i < 10; i++) {
      promises.push(DigitalRupiahInstance.transfer(accounts[1], 1));
    }

    const startTime = new Date().getTime();
    await Promise.all(promises);

    const endTime = new Date().getTime();

    console.log(
      `Call to create 10 transfer took ${endTime - startTime} milliseconds`
    );
  });

  it("create 30 digital rupiah transfer", async () => {
    const CBDC_DappsInstance = await CBDC_Dapps.deployed();

    const digitalRupiahAddress = await CBDC_DappsInstance.digitalRupiah();
    const DigitalRupiahInstance = await DigitalRupiah.at(digitalRupiahAddress);

    await DigitalRupiahInstance.mint(
      accounts[0],
      web3.utils.toWei("10000000000", "ether")
    );

    const promises = [];

    for (let i = 0; i < 30; i++) {
      promises.push(DigitalRupiahInstance.transfer(accounts[1], 1));
    }

    const startTime = new Date().getTime();
    await Promise.all(promises);

    const endTime = new Date().getTime();

    console.log(
      `Call to create 30 transfer took ${endTime - startTime} milliseconds`
    );
  });

  it("create 50 digital rupiah transfer", async () => {
    const CBDC_DappsInstance = await CBDC_Dapps.deployed();

    const digitalRupiahAddress = await CBDC_DappsInstance.digitalRupiah();
    const DigitalRupiahInstance = await DigitalRupiah.at(digitalRupiahAddress);

    await DigitalRupiahInstance.mint(
      accounts[0],
      web3.utils.toWei("10000000000", "ether")
    );

    const promises = [];

    for (let i = 0; i < 50; i++) {
      promises.push(DigitalRupiahInstance.transfer(accounts[1], 1));
    }

    const startTime = new Date().getTime();
    await Promise.all(promises);

    const endTime = new Date().getTime();

    console.log(
      `Call to create 50 transfer took ${endTime - startTime} milliseconds`
    );
  });

  it("create 75 digital rupiah transfer", async () => {
    const CBDC_DappsInstance = await CBDC_Dapps.deployed();

    const digitalRupiahAddress = await CBDC_DappsInstance.digitalRupiah();
    const DigitalRupiahInstance = await DigitalRupiah.at(digitalRupiahAddress);

    await DigitalRupiahInstance.mint(
      accounts[0],
      web3.utils.toWei("10000000000", "ether")
    );

    const promises = [];

    for (let i = 0; i < 75; i++) {
      promises.push(DigitalRupiahInstance.transfer(accounts[1], 1));
    }

    const startTime = new Date().getTime();
    await Promise.all(promises);

    const endTime = new Date().getTime();

    console.log(
      `Call to create 75 transfer took ${endTime - startTime} milliseconds`
    );
  });

  it("create 100 digital rupiah transfer", async () => {
    const CBDC_DappsInstance = await CBDC_Dapps.deployed();

    const digitalRupiahAddress = await CBDC_DappsInstance.digitalRupiah();
    const DigitalRupiahInstance = await DigitalRupiah.at(digitalRupiahAddress);

    await DigitalRupiahInstance.mint(
      accounts[0],
      web3.utils.toWei("10000000000", "ether")
    );

    const promises = [];

    for (let i = 0; i < 100; i++) {
      promises.push(DigitalRupiahInstance.transfer(accounts[1], 1));
    }

    const startTime = new Date().getTime();
    await Promise.all(promises);

    const endTime = new Date().getTime();

    console.log(
      `Call to create 100 transfer took ${endTime - startTime} milliseconds`
    );
  });
});
