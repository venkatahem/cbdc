import React, { Component } from "react";
import { Header, Divider, Table, Popup } from "semantic-ui-react";

import * as rupiahFormater from "../../../helper_function/rupiahFormater";
import { format_timestamp_short } from "../../../helper_function/unixDate";

import getContract from "../../../lib/getContract";
import getWeb3Adresses from "../../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../../build/contracts/CBDC_Dapps.json";
import DigitalRupiah_build from "../../../../build/contracts/DigitalRupiah.json";
import web3_utils from "web3-utils";

import Layout from "../../../components/layout";

class RedemptionDigitalRupiah extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accounts: undefined,
      CBDC_Dapps: undefined,
      DigitalRupiah: undefined,
      BI_owned: 0,
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);

    const DigitalRupiahAddress = await CBDC_Dapps.methods
      .digitalRupiah()
      .call();

    const DigitalRupiah = await getContract(
      web3,
      DigitalRupiah_build,
      DigitalRupiahAddress
    );

    const redemption_raw = await DigitalRupiah.getPastEvents("Redemption", {
      fromBlock: 0,
      toBlock: "latest",
    });

    const redemption = await Promise.all(
      redemption_raw.map(async (content, index) => {
        const block = await web3.eth.getBlock(content.blockHash);
        const timestamp = block.timestamp;
        const rv = content.returnValues;

        const sender_data = await CBDC_Dapps.methods
          .addressToParticipant(rv.sender)
          .call({}, content.blockHash);

        return {
          timestamp: timestamp,
          txhash: content.transactionHash,
          sender: rv.sender,
          sender_name: sender_data.name,
          value: rv.value,
        };
      })
    );

    redemption.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

    this.setState({
      web3,
      accounts,
      CBDC_Dapps,
      DigitalRupiah,
      redemption,
    });
  }

  renderRow() {
    if (this.state.web3 != undefined && this.state.accounts[0] != undefined) {
      return this.state.redemption.map((content, index) => {
        const value_readable =
          "D" +
          rupiahFormater.IDR.format(
            web3_utils.fromWei(content.value.toString(), "ether")
          );

        return (
          <Table.Row>
            <Table.Cell>{`${format_timestamp_short(
              content.timestamp
            )} WIB`}</Table.Cell>
            <Table.Cell style={{ "word-wrap": "break-word" }}>
              {content.txhash}
            </Table.Cell>
            <Table.Cell style={{ "word-wrap": "break-word" }}>
              {
                <Popup
                  content={content.sender}
                  header={"Account Address"}
                  trigger={
                    <span>
                      {content.sender_name
                        ? content.sender_name
                        : "Unregistered Account"}
                    </span>
                  }
                  position="left center"
                  hoverable
                />
              }
            </Table.Cell>

            <Table.Cell textAlign="right" style={{ color: "#1188BD" }}>
              <b>{value_readable}</b>
            </Table.Cell>
          </Table.Row>
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
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Transaction Hash</Table.HeaderCell>
            <Table.HeaderCell>Redeemer</Table.HeaderCell>
            <Table.HeaderCell>Value</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{this.renderRow()}</Table.Body>
      </Table>
    );
  }

  render() {
    const { redemption } = this.state;

    return (
      <Layout>
        <Header as="h1" textAlign="center">
          Digital Rupee Redemption History
        </Header>

        <Divider />
        <br></br>
        {this.renderTable()}
      </Layout>
    );
  }
}

export default RedemptionDigitalRupiah;
