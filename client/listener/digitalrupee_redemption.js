const Web3 = require("web3");
const DigitalRupee_build = require("../../build/contracts/DigitalRupee.json");
const CBDC_Dapps_build = require("../../build/contracts/CBDC_Dapps.json");

const init = async () => {
  const provider = new Web3("http://127.0.0.1:8545");
  const web3 = new Web3(provider);
  const netId = await web3.eth.net.getId();

  const cbdc = new web3.eth.Contract(
    CBDC_Dapps_build.abi,
    CBDC_Dapps_build.networks[netId].address
  );

  const address = await cbdc.methods.digitalRupee().call();

  const token = new web3.eth.Contract(DigitalRupee_build.abi, address);

  token.events.Redemption({}).on("data", (event) => console.log(event));
};

init();
