const Web3 = require("web3");
const SBN_build = require("../../build/contracts/SBN.json");
const CBDC_Dapps_build = require("../../build/contracts/CBDC_Dapps.json");

const init = async (sbn_index) => {
  const provider = new Web3("ws://127.0.0.1:8546");
  const web3 = new Web3(provider);
  const netId = await web3.eth.net.getId();

  const cbdc = new web3.eth.Contract(
    CBDC_Dapps_build.abi,
    CBDC_Dapps_build.networks[netId].address
  );

  const sbn_addresses = await cbdc.methods.getSbnAddresses().call();

  const selected_address = sbn_addresses[sbn_index];

  const token = new web3.eth.Contract(SBN_build.abi, selected_address);

  token.events.Redemption({}).on("data", (event) => console.log(event));
};

init(1);
