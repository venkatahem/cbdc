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

  async getUserBalance() {
    const { DigitalRupiah, accounts } = this.state;
    try {
      const balance = await DigitalRupiah.methods.balanceOf(accounts[0]).call();
      return balance;
    } catch {
      return null;
    }
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);
    if (CBDC_Dapps !== undefined) {
      const DigitalRupiahAddress = await CBDC_Dapps.methods
        .digitalRupiah()
        .call();

      console.log(DigitalRupiahAddress);
      const DigitalRupiah = await getContract(
        web3,
        DigitalRupiah_build,
        DigitalRupiahAddress
      );

      const sbnAddresses = await CBDC_Dapps.methods.getSbnAddresses().call();

      this.state = {
        accounts,
        DigitalRupiah,
      };

      const userBalance = await this.getUserBalance();

      this.setState({
        web3,
        accounts,
        CBDC_Dapps,
        DigitalRupiah,
        sbnAddresses,
        userBalance,
      });
    }
  }

  renderRow() {
    if (this.state.web3 != undefined && this.state.accounts[0] != undefined) {
      return this.state.sbnAddresses.map((address, index) => {
        return (
          <SbnRow
            index={index}
            web3={this.state.web3}
            accounts={this.state.accounts}
            address={address}
          ></SbnRow>
        );
      });
    } else {
      return;
    }
  }

  renderTable() {
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>SBN Code</Table.HeaderCell>
            <Table.HeaderCell>Smart Contract Address</Table.HeaderCell>
            <Table.HeaderCell>Release Date</Table.HeaderCell>
            <Table.HeaderCell>Maturity Date</Table.HeaderCell>
            <Table.HeaderCell>Owned Unit</Table.HeaderCell>
            <Table.HeaderCell>Unit Price</Table.HeaderCell>
            <Table.HeaderCell>Total Price</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{this.renderRow()}</Table.Body>
      </Table>
    );
  }

  render() {
    const { accounts } = this.state;
    let { userBalance } = this.state;
    userBalance = userBalance ? web3_utils.fromWei(userBalance, "ether") : "";

    return (
      <Layout>
        <Header as="h1" textAlign="center">
          DASHBOARD
        </Header>

        <Segment>
          <Header as="h1" textAlign="center">
            <Header sub textAlign="center">
              Digital Rupiah Balance
            </Header>
            {"D" + rupiahFormater.IDR.format(userBalance)}{" "}
            <Header.Subheader>( {terbilang(userBalance)} )</Header.Subheader>
          </Header>
        </Segment>
        <Divider />
        <Header as="h2" textAlign="center">
          SBN Ownership
        </Header>
        {this.renderTable()}
      </Layout>
    );
  }
}

export default Dapp;
