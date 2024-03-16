import React, { Component } from "react";
import { Header, Divider, Table, Popup, Segment } from "semantic-ui-react";

import * as rupeeFormater from "../../../helper_function/rupeeFormater";
import terbilang from "../../../helper_function/rupeeTerbilang";
import { format_timestamp_short } from "../../../helper_function/unixDate";

import getContract from "../../../lib/getContract";
import getWeb3Adresses from "../../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../../build/contracts/CBDC_Dapps.json";
import web3_utils from "web3-utils";

import Layout from "../../../components/layout";
import SBNDropdown from "../../../components/SBNDropdown";

class RedemptionDigitalRupee extends Component {
  constructor(props) {
    super(props);

    const selected_SBN_detail = { total_supply: 0, BI_owned: 0, code: "" };
    this.state = {
      accounts: undefined,
      CBDC_Dapps: undefined,
      selected_SBN_detail,
      redemption: [],
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);

    this.setState({
      web3,
      accounts,
      CBDC_Dapps,
    });
  }

  updateSBNDetail = async () => {
    const { selected_SBN, CBDC_Dapps, web3 } = this.state;
    const SBN_contract = selected_SBN;

    const code = await SBN_contract.methods.symbol().call();
    const name = await SBN_contract.methods.name().call();
    const release_date = await SBN_contract.methods
      .Timestamp_releaseDate()
      .call();
    const maturity_date = await SBN_contract.methods
      .Timestamp_maturityDate()
      .call();

    const initial_unit_price = await SBN_contract.methods
      .initialUnitPrice()
      .call();

    const total_supply = await SBN_contract.methods.totalSupply().call();

    const BI_address = await CBDC_Dapps.methods.BankIndonesiaAddress().call();

    const BI_owned = await SBN_contract.methods.balanceOf(BI_address).call();

    const address = SBN_contract._address;

    const detail = {
      code,
      name,
      release_date,
      maturity_date,
      initial_unit_price,
      total_supply,
      BI_owned,
      address,
    };

    const redemption_raw = await SBN_contract.getPastEvents("Redemption", {
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
      selected_SBN_detail: detail,
      redemption: redemption,
    });
  };

  onChangeSBNDropdown = async (event, data) => {
    this.state.selected_SBN = data.value;
    await this.updateSBNDetail();
  };

  renderRow() {
    if (this.state.web3 != undefined && this.state.accounts[0] != undefined) {
      return this.state.redemption.map((content, index) => {
        const value_readable = rupeeFormater.whole_number.format(
          content.value
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
    const { selected_SBN_detail, redemption } = this.state;

    return (
      <Layout>
        <Header as="h1" textAlign="center">
          SBN Redemption History
        </Header>

        <Header as="h3">Select SBN:</Header>
        <SBNDropdown onChange={this.onChangeSBNDropdown} />

        <br></br>
        <Header as="h3" textAlign="center">
          {selected_SBN_detail.code}
        </Header>
        {redemption.length > 0 ? this.renderTable() : null}
      </Layout>
    );
  }
}

export default RedemptionDigitalRupee;
