import React, { Component } from "react";
import { Table, Header, Divider, Segment, Popup } from "semantic-ui-react";

import * as rupiahFormater from "../../helper_function/rupiahFormater";
import terbilang from "../../helper_function/rupiahTerbilang";
import { format_timestamp_short } from "../../helper_function/unixDate";

import getContract from "../../lib/getContract";
import getWeb3Adresses from "../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../build/contracts/CBDC_Dapps.json";
import DigitalRupiah_build from "../../../build/contracts/DigitalRupiah.json";
import web3_utils from "web3-utils";

import Layout from "../../components/layout";

class DigitalRupiahIndex extends Component {
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

      const DigitalRupiah = await getContract(
        web3,
        DigitalRupiah_build,
        DigitalRupiahAddress
      );

      this.state = {
        accounts,
        DigitalRupiah,
      };

      const userBalance = await this.getUserBalance();

      const participant = await CBDC_Dapps.methods
        .addressToParticipant(accounts[0])
        .call();

      const send_raw = await DigitalRupiah.getPastEvents("Transfer", {
        filter: { from: accounts[0] },
        fromBlock: 0,
        toBlock: "latest",
      });

      const send = await Promise.all(
        send_raw.map(async (content, index) => {
          const block = await web3.eth.getBlock(content.blockHash);
          const balance = await DigitalRupiah.methods
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

      const receive_raw = await DigitalRupiah.getPastEvents("Transfer", {
        filter: { to: accounts[0] },
        fromBlock: 0,
        toBlock: "latest",
      });

      const receive = await Promise.all(
        receive_raw.map(async (content, index) => {
          const block = await web3.eth.getBlock(content.blockHash);

          const balance = await DigitalRupiah.methods
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
        web3,
        accounts,
        CBDC_Dapps,
        DigitalRupiah,
        userBalance,
        all_activities,
      });
    }
  }

  renderRow() {
    if (this.state.web3 != undefined && this.state.accounts[0] != undefined) {
      return this.state.all_activities.map((content, index) => {
        const value_readable =
          "D" +
          rupiahFormater.IDR.format(
            web3_utils.fromWei(content.value.toString(), "ether")
          );

        const balance_readable =
          "D" +
          rupiahFormater.IDR.format(
            web3_utils.fromWei(content.balance.toString(), "ether")
          );
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
                      {content.to_name
                        ? content.to_name
                        : "Unregistered Account"}
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
              <b>{value_readable}</b>
            </Table.Cell>
            <Table.Cell>{content.send ? "Send" : "Receive"}</Table.Cell>
            <Table.Cell textAlign="right">{balance_readable}</Table.Cell>
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
            <Table.HeaderCell>Sender/Receiver Name</Table.HeaderCell>
            <Table.HeaderCell>Value</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Balance</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{this.renderRow()}</Table.Body>
      </Table>
    );
  }

  render() {
    const { all_activities } = this.state;

    let { userBalance } = this.state;
    userBalance = userBalance ? web3_utils.fromWei(userBalance, "ether") : "";

    return (
      <Layout>
        <Header as="h1" textAlign="center">
          Digital Rupiah Account Information
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
          Latest Digital Rupiah Account Activities
        </Header>
        <br></br>
        {this.renderTable()}
      </Layout>
    );
  }
}

export default DigitalRupiahIndex;
