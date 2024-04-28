import React, { Component } from "react";
import {
  Table,
  Button,
  Icon,
  Confirm,
  Segment,
  Message,
} from "semantic-ui-react";

import SBN_build from "../../build/contracts/SBN.json";
import Request_build from "../../build/contracts/Request.json";
import getContract from "../lib/getContract";

import * as unixDate from "../helper_function/unixDate";
import * as rupeeFormater from "../helper_function/rupeeFormater";

import {
  RequestStatus,
  ReadableStatus,
  reverseReadableStatus,
} from "../helper_function/RequestStatus";

import web3_utils from "web3-utils";

class SellRequestRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      SBN_code: "",
      SBN_address: "",
      SBN_unit_price: 0,
      buyer_address: "",
      buyer_name: "",
      total_unit: 1,
      total_sell_price: 0,
      request_expired: 0,
      loading: false,
    };
  }

  async getAllowanceAmount(ERC20, from, to) {
    const allowance = await ERC20.methods.allowance(from, to).call();

    return allowance;
  }

  async getStatus() {
    const { accounts, web3 } = this.props;

    const {
      SBN,
      request_address,
      total_unit,
      request_contract,
      request_expired,
      block_timestamp,
    } = this.state;

    const raw_status = await request_contract.methods.status().call();

    let status;

    if (block_timestamp > request_expired) {
      status = ReadableStatus.Expired;
    } else if (raw_status == RequestStatus.PendingBuyer) {
      status = ReadableStatus.PendingBuyer;
      const allowance = await this.getAllowanceAmount(
        SBN,
        accounts[0],
        request_address
      );

      if (allowance < total_unit) {
        status = ReadableStatus.PendingSellerApproval;
      }
    } else if (raw_status == RequestStatus.Accepted) {
      status = ReadableStatus.Accepted;
    } else if (raw_status == RequestStatus.Rejected) {
      status = ReadableStatus.Rejected;
    } else if (raw_status == RequestStatus.Cancelled) {
      status = ReadableStatus.Cancelled;
    }
    return status;
  }

  async componentDidMount() {
    const { request, web3, participants, accounts } = this.props;

    const SBN_address = request["SBN"];
    const SBN = await getContract(web3, SBN_build, SBN_address);
    const SBN_code = await SBN.methods.symbol().call();
    const SBN_unit_price = await SBN.methods.initialUnitPrice().call();

    const buyer_address = request["buyer"];
    const buyer_name = participants[buyer_address];

    const total_unit = request["sbnAmount"];

    const total_sell_price = web3_utils.fromWei(
      request["rupeeAmount"].toString(),
      "ether"
    );

    const request_address = request["requestAddress"];
    const request_contract = await getContract(
      web3,
      Request_build,
      request_address
    );

    const request_expired = await request_contract.methods
      .Timestamp_expiredDate()
      .call();

    const current_block = await web3.eth.getBlock("latest");
    const block_timestamp = current_block.timestamp;

    this.state = {
      SBN,
      request_address,
      total_unit,
      request_contract,
      request_expired,
      block_timestamp,
    };

    let status = await this.getStatus();

    this.setState({
      SBN,
      SBN_address,
      SBN_code,
      SBN_unit_price,
      buyer_address,
      buyer_name,
      total_unit,
      total_sell_price,
      request_address,
      request_contract,
      request_expired,
      status,
    });
  }

  onApprove = async (event) => {
    event.preventDefault();

    try {
      this.setState({ loading: true, errorMessage: "", positiveMessage: "" });

      const { accounts } = this.props;
      const { request_address, SBN, total_unit } = this.state;

      const txhash = await SBN.methods
        .approve(request_address, total_unit)
        .send({
          from: accounts[0],
        });

      let status = await this.getStatus(status);

      this.setState({
        positiveMessage:
          "SBN approval succeed! \n Transaction hash: " +
          txhash.transactionHash,
        status,
      });
    } catch (e) {
      console.log(e.message);
      this.setState({
        errorMessage: e.message.includes(`"status": false`)
          ? "Transaction failed. Make sure you are an active CBDC participant and fill the form correctly"
          : e.message,
      });
    }
    this.setState({ loading: false });
  };

  onCancel = async (event) => {
    event.preventDefault();

    try {
      this.setState({ loading: true, errorMessage: "", positiveMessage: "" });

      const { accounts } = this.props;
      const { request_contract } = this.state;

      const txhash = await request_contract.methods.cancel().send({
        from: accounts[0],
      });

      let status = await this.getStatus(status);

      this.setState({
        positiveMessage:
          "Cancel request succeed! \n Transaction hash: " +
          txhash.transactionHash,
        status,
      });
    } catch (e) {
      console.log(e.message);
      this.setState({
        errorMessage: e.message.includes(`"status": false`)
          ? "Transaction failed. Make sure you are an active CBDC participant and fill the form correctly"
          : e.message,
      });
    }
    this.setState({ loading: false });
  };

  render() {
    const {
      SBN_unit_price,
      total_sell_price,
      total_unit,
      request_expired,
      status,
    } = this.state;

    const unit_price = web3_utils.fromWei(SBN_unit_price.toString(), "ether");
    const unit_price_readable = rupeeFormater.Rp.format(unit_price);

    const requested_unit_price = total_sell_price / total_unit;

    const requested_unit_price_readable = rupeeFormater.Rp.format(
      requested_unit_price.toString()
    );

    const margin = (
      ((requested_unit_price - unit_price) / unit_price) *
      100
    ).toFixed(2);

    const total_sell_price_readable = rupeeFormater.Rp.format(total_sell_price);

    const expired_readable = unixDate.format_timestamp(request_expired);

    const status_readable =
      reverseReadableStatus[status ? status.toString() : "0"];

    if (
      !(
        status == ReadableStatus.PendingBuyer ||
        status == ReadableStatus.PendingBuyerApproval ||
        status == ReadableStatus.PendingSellerApproval
      )
    )
      return <></>;
    return (
      <>
        <Confirm
          open={!!this.state.errorMessage}
          content={
            <Segment>
              <Message
                error
                header="Transaction Rejected"
                content="Transaction has been cancelled or an Error has ocurred"
              />
            </Segment>
          }
          cancelButton={null}
          onConfirm={() => this.setState({ errorMessage: "" })}
        />

        <Confirm
          open={!!this.state.positiveMessage}
          // content="Transaction has been cancelled or an Error has ocurred"
          content={
            <Segment>
              <Message
                positive
                header="Transaction Succeed!"
                content={this.state.positiveMessage}
              />
            </Segment>
          }
          cancelButton={null}
          onConfirm={() => this.setState({ positiveMessage: "" })}
        />
        <Table.Row>
          <Table.Cell>{this.state.SBN_code}</Table.Cell>
          <Table.Cell>{this.state.buyer_name}</Table.Cell>
          <Table.Cell>{this.state.total_unit}</Table.Cell>
          <Table.Cell>{unit_price_readable}</Table.Cell>
          <Table.Cell>
            {requested_unit_price_readable} ({margin}%)
          </Table.Cell>
          <Table.Cell>{total_sell_price_readable}</Table.Cell>
          <Table.Cell>{expired_readable} WIB</Table.Cell>
          <Table.Cell>{status_readable}</Table.Cell>
          <Table.Cell>
            {status == ReadableStatus.PendingSellerApproval ? (
              <Button
                icon
                color="blue"
                onClick={this.onApprove}
                loading={this.state.loading}
              >
                <Icon name="check circle" />
              </Button>
            ) : null}
            {status == ReadableStatus.PendingBuyer ||
            status == ReadableStatus.PendingSellerApproval ? (
              <Button
                icon
                color="red"
                onClick={this.onCancel}
                loading={this.state.loading}
              >
                <Icon name="close" />
              </Button>
            ) : null}
          </Table.Cell>
        </Table.Row>
      </>
    );
  }
}

export default SellRequestRow;
