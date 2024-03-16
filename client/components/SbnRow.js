import React, { Component } from "react";
import { Table } from "semantic-ui-react";

import SBN_build from "../../build/contracts/SBN.json";
import getContract from "../lib/getContract";

import * as unixDate from "../helper_function/unixDate";
import * as rupeeFormater from "../helper_function/rupeeFormater";

import web3_utils from "web3-utils";

class SbnRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      SBN_code: "",
      release_date: 0,
      maturity_date: 0,
      owned_unit: 0,
      unit_price: 0,
    };
  }

  async componentDidMount() {
    const SBN = await getContract(
      this.props.web3,
      SBN_build,
      this.props.address
    );

    const SBN_code = await SBN.methods.symbol().call();

    const release_date = await SBN.methods.Timestamp_releaseDate().call();

    const maturity_date = await SBN.methods.Timestamp_maturityDate().call();

    const owned_unit = await SBN.methods
      .balanceOf(this.props.accounts[0])
      .call();

    const unit_price = await SBN.methods.initialUnitPrice().call();

    this.setState({
      SBN_code,
      release_date,
      owned_unit,
      maturity_date,
      unit_price,
    });
  }

  render() {
    const release_date_readable = unixDate.format_date(this.state.release_date);
    const maturity_date_readable = unixDate.format_date(
      this.state.maturity_date
    );

    const unit_price_readable = rupeeFormater.Rp.format(
      web3_utils.fromWei(this.state.unit_price.toString(), "ether")
    );

    const total_price = rupeeFormater.Rp.format(
      web3_utils.fromWei(this.state.unit_price.toString(), "ether") *
        this.state.owned_unit
    );
    return (
      <>
        <Table.Row>
          <Table.Cell>{this.state.SBN_code}</Table.Cell>
          <Table.Cell>{this.props.address}</Table.Cell>
          <Table.Cell>{release_date_readable}</Table.Cell>
          <Table.Cell>{maturity_date_readable}</Table.Cell>
          <Table.Cell>
            {rupeeFormater.whole_number.format(this.state.owned_unit)}
          </Table.Cell>
          <Table.Cell>{unit_price_readable}</Table.Cell>
          <Table.Cell>{total_price}</Table.Cell>
        </Table.Row>
      </>
    );
  }
}

export default SbnRow;
