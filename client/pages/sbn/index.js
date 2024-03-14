import React, { Component } from "react";
import { Table, Header, Divider, Popup } from "semantic-ui-react";
import SbnRow from "../../components/SbnRow";
import SBNDropdown from "../../components/SBNDropdown";

import * as rupiahFormater from "../../helper_function/rupiahFormater";
import { format_timestamp_short } from "../../helper_function/unixDate";

import getContract from "../../lib/getContract";
import getWeb3Adresses from "../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../build/contracts/CBDC_Dapps.json";
import web3_utils from "web3-utils";

import Layout from "../../components/layout";

class SBNIndex extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: undefined,
      accounts: undefined,
      CBDC_Dapps: undefined,
      sbnAddresses: [],
      all_activities: [],
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);

    const participant = await CBDC_Dapps.methods
      .addressToParticipant(accounts[0])
      .call();

    const sbnAddresses = await CBDC_Dapps.methods.getSbnAddresses().call();
    this.setState({
      web3,
      accounts,
      CBDC_Dapps,
      participant,
      sbnAddresses,
    });
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

  renderActivityRow() {
    return this.state.all_activities.map((content, index) => {
      return (
        <Table.Row>
          <Table.Cell>{`${format_timestamp_short(
            content.timestamp
          )} WIB`}</Table.Cell>
          <Table.Cell style={{ "word-wrap": "break-word" }}>
            {content.txhash}
          </Table.Cell>
          <Table.Cell>
            {content.send ? (
              <Popup
                content={content.to}
                header={"Account Address"}
                trigger={
                  <span>
                    {content.to_name ? content.to_name : "Unregistered Account"}
                  </span>
                }
                position="left center"
                hoverable
              />
            ) : (
              <Popup
                content={content.from}
                header={"Account Address"}
                trigger={
                  <span>
                    {content.from_name
                      ? content.from_name
                      : "Unregistered Account"}
                  </span>
                }
                position="left center"
                hoverable
              />
            )}
          </Table.Cell>
          <Table.Cell
            textAlign="right"
            style={content.send ? { color: "#FA0100" } : { color: "#1188BD" }}
          >
            <b>{rupiahFormater.whole_number.format(content.value)}</b>
          </Table.Cell>
          <Table.Cell>{content.send ? "Send" : "Receive"}</Table.Cell>
          <Table.Cell textAlign="right">
            {rupiahFormater.whole_number.format(content.balance)}
          </Table.Cell>
        </Table.Row>
      );
    });
  }

  renderAccountAvtivities() {
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Transaction Hash</Table.HeaderCell>
            <Table.HeaderCell>Sender/Receiver Name</Table.HeaderCell>
            <Table.HeaderCell>Unit</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Balance</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{this.renderActivityRow()}</Table.Body>
      </Table>
    );
  }

  onChangeSBNDropdown = async (event, data) => {
    const { web3, accounts, participant, CBDC_Dapps } = this.state;

    const selected_SBN = data.value;

    const send_raw = await selected_SBN.getPastEvents("Transfer", {
      filter: { from: accounts[0] },
      fromBlock: 0,
      toBlock: "latest",
    });

    const send = await Promise.all(
      send_raw.map(async (content, index) => {
        const block = await web3.eth.getBlock(content.blockHash);
        const balance = await selected_SBN.methods
          .balanceOf(accounts[0])
          .call({}, content.blockHash);
        const timestamp = block.timestamp;
        const rv = content.returnValues;

        let to = await CBDC_Dapps.methods
          .addressToParticipant(rv.to)
          .call({}, content.blockHash);

        if (to.name === "") {
          const code = await web3.eth.getCode(rv.to);
          if (code !== "0x") to = { name: "Contract" };
        }

        if (rv.to === "0x0000000000000000000000000000000000000000")
          to = { name: "Redemption" };

        return {
          timestamp: timestamp,
          txhash: content.transactionHash,
          from: rv.from,
          from_name: participant.name,
          to: rv.to,
          to_name: to.name,
          value: rv.value,
          balance: balance,
          send: true,
        };
      })
    );

    const receive_raw = await selected_SBN.getPastEvents("Transfer", {
      filter: { to: accounts[0] },
      fromBlock: 0,
      toBlock: "latest",
    });

    const receive = await Promise.all(
      receive_raw.map(async (content, index) => {
        const block = await web3.eth.getBlock(content.blockHash);

        const balance = await selected_SBN.methods
          .balanceOf(accounts[0])
          .call({}, content.blockHash);

        const timestamp = block.timestamp;
        const rv = content.returnValues;

        const from =
          rv.from === "0x0000000000000000000000000000000000000000"
            ? { name: "Issuance" }
            : await CBDC_Dapps.methods
                .addressToParticipant(rv.from)
                .call({}, content.blockHash);

        if (from.name === "") {
          const code = await web3.eth.getCode(rv.from);
          if (code !== "0x") from = { name: "Contract" };
        }

        return {
          timestamp: timestamp,
          txhash: content.transactionHash,
          from: rv.from,
          from_name: from.name,
          to: rv.to,
          to_name: participant.name,
          value: rv.value,
          balance: balance,
          send: false,
        };
      })
    );

    let all_activities = send.concat(receive);

    all_activities.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

    this.setState({
      all_activities,
    });
  };

  render() {
    const { selectedSBN, all_activities } = this.state;

    return (
      <Layout>
        <Header as="h1" textAlign="center">
          SBN Account Information
        </Header>

        <Divider />
        <Header as="h2" textAlign="center">
          SBN Ownership
        </Header>
        {this.renderTable()}

        <Header as="h2" textAlign="center">
          SBN Account Activities
        </Header>

        <Header as="h3"> Choose SBN to see activities </Header>
        <SBNDropdown onChange={this.onChangeSBNDropdown} />
        {all_activities.length > 0 ? this.renderAccountAvtivities() : null}
      </Layout>
    );
  }
}

export default SBNIndex;
