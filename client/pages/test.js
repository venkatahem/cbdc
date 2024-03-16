import React, { Component } from "react";
import { Table, Header, Divider, Segment } from "semantic-ui-react";
import SbnRow from "../components/SbnRow";

import * as rupeeFormater from "../helper_function/rupeeFormater";
import terbilang from "../helper_function/rupeeTerbilang";

import getContract from "../lib/getContract";
import getWeb3Adresses from "../lib/getWeb3Address";
import CBDC_Dapps_build from "../../build/contracts/CBDC_Dapps.json";
import DigitalRupee_build from "../../build/contracts/DigitalRupee.json";
import web3_utils from "web3-utils";

import Layout from "../components/layout";

class Dapp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: undefined,
      accounts: undefined,
      CBDC_Dapps: undefined,
      DigitalRupee: undefined,
      userBalance: 0,
      sbnAddresses: [],
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);
    if (CBDC_Dapps !== undefined) {
      const DigitalRupeeAddress = await CBDC_Dapps.methods
        .digitalRupee()
        .call();

      const DigitalRupee = await getContract(
        web3,
        DigitalRupee_build,
        DigitalRupeeAddress
      );

      //   await DigitalRupee.methods
      //     .mint(accounts[0], web3_utils.toWei("1000000000", "ether"))
      //     .send({ from: accounts[0] });

      console.log(DigitalRupeeAddress);

      const test = await DigitalRupee.methods.test().call();
      const test2 = await DigitalRupee.methods.test2().call();

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
