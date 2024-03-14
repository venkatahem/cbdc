import router from "next/router";

const getContractInstance = async (
  web3,
  contractDefinition,
  address = undefined
) => {
  let deployedAddress;
  let instance = undefined;

  if (address === undefined) {
    try {
      const networkId = await web3.eth.net.getId();
      deployedAddress = contractDefinition.networks[networkId].address;
    } catch (e) {}
  } else {
    deployedAddress = address;
  }

  // create the instance
  if (deployedAddress !== undefined) {
    try {
      instance = new web3.eth.Contract(contractDefinition.abi, deployedAddress);
    } catch (e) {}
  } else {
    //alert(contractDefinition.contractName + " is deployed on this network");
    router.replace("/SCerror");
  }
  return instance;
};

export default getContractInstance;
