import React, { Component } from "react";
import { Table, Header, Divider, Segment } from "semantic-ui-react";
import SbnRow from "../components/SbnRow";

import * as rupiahFormater from "../helper_function/rupiahFormater";
import terbilang from "../helper_function/rupiahTerbilang";

import getContract from "../lib/getContract";
import getWeb3Adresses from "../lib/getWeb3Address";
import CBDC_Dapps_build from "../../build/contracts/CBDC_Dapps.json";
import DigitalRupiah_build from "../../build/contracts/DigitalRupiah.json";
import web3_utils from "web3-utils";

import Layout from "../components/layout";

class Dapp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: undefined,
      accounts: undefined,
      CBDC_Dapps: undefined,
      DigitalRupiah: undefined,
      userBalance: 0,
      sbnAddresses: [],
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);
    if (CBDC_Dapps !== undefined) {
      const DigitalRupiahAddress = await CBDC_Dapps.methods
        .digitalRupiah()
        .call();

      const DigitalRupiah = await getContract(
        web3,
        DigitalRupiah_build,
        DigitalRupiahAddress
      );

      //   await DigitalRupiah.methods
      //     .mint(accounts[0], web3_utils.toWei("1000000000", "ether"))
      //     .send({ from: accounts[0] });

      console.log(DigitalRupiahAddress);

      const test = await DigitalRupiah.methods.test().call();
      const test2 = await DigitalRupiah.methods.test2().call();

      this.setState({
        test,
        test2,
      });
    }
  }

  render() {
    console.log(this.state);

    return <> {"test"}</>;
  }
}

export default Dapp;
