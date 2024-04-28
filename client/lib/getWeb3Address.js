import getWeb3 from "./getWeb3";

const getWeb3Adresses = async () => {
  try {
    const web3 = await getWeb3();

    const accounts = await web3.eth.getAccounts();

    return { web3, accounts };
  } catch (error) {
    // Catch any errors for any of the above operations.
    console.log(error.message);
  }
};

export default getWeb3Adresses;
