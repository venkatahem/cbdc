import React, { Component } from "react";
import {
  Table,
  Button,
  Modal,
  Header,
  Dimmer,
  Loader,
  Message,
  Icon,
  Popup,
  Confirm,
  Segment,
} from "semantic-ui-react";

import SBN_build from "../../build/contracts/SBN.json";
import Request_build from "../../build/contracts/Request.json";
import getContract from "../lib/getContract";

import * as unixDate from "../helper_function/unixDate";
import * as rupiahFormater from "../helper_function/rupiahFormater";
import {
  RequestStatus,
  ReadableStatus,
  reverseReadableStatus,
} from "../helper_function/RequestStatus";

import web3_utils from "web3-utils";
import terbilang from "../helper_function/rupiahTerbilang";

class BuyRequestRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      SBN_code: "",
      SBN_address: "",
      SBN_unit_price: 0,
      buyer_address: "",
      buyer_name: "",
      total_unit: 1,
      total_buy_price: 0,
      request_expired: 0,
      loading: false,
      open: false,
    };
  }

  async getAllowanceAmount(ERC20, from, to) {
    const allowance = await ERC20.methods.allowance(from, to).call();

    return allowance;
  }

  async getStatus() {
    const { accounts, DigitalRupiah } = this.props;
    const {
      SBN,
      seller_address,
      request_address,
      total_unit,
      request_contract,
      total_buy_price,
      block_timestamp,
      request_expired,
    } = this.state;

    const raw_status = await request_contract.methods.status().call();

    let status;

    if (block_timestamp > request_expired) {
      status = ReadableStatus.Expired;
    } else if (raw_status == RequestStatus.PendingBuyer) {
      status = ReadableStatus.PendingBuyer;
      const sbn_allowance = await this.getAllowanceAmount(
        SBN,
        seller_address,
        request_address
      );

      if (sbn_allowance < total_unit) {
        status = ReadableStatus.PendingSellerApproval;
        return status;
      }

      // const DigitalRupiah_allowance = await this.getAllowanceAmount(
      //   DigitalRupiah,
      //   accounts[0],
      //   request_address
      // );

      // if (
      //   DigitalRupiah_allowance <
      //   web3_utils.toWei(total_buy_price.toString(), "ether")
      // ) {
      //   status = ReadableStatus.PendingBuyerApproval;
      //   return status;
      // }
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
    const { request, web3, participants } = this.props;

    const SBN_address = request["SBN"];
    const SBN = await getContract(web3, SBN_build, SBN_address);
    const SBN_code = await SBN.methods.symbol().call();
    const SBN_unit_price = await SBN.methods.initialUnitPrice().call();

    const seller_address = request["seller"];
    const seller_name = participants[seller_address];

    const total_unit = request["sbnAmount"];

    const total_buy_price = web3_utils.fromWei(
      request["rupiahAmount"].toString(),
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
      seller_address,
      total_buy_price,
      request_expired,
      block_timestamp,
    };

    let status = await this.getStatus();

    this.setState({
      SBN,
      SBN_address,
      SBN_code,
      SBN_unit_price,
      seller_address,
      seller_name,
      total_unit,
      total_buy_price,
      request_address,
      request_contract,
      request_expired,
      status,
    });
  }

  // onApprove = async (event) => {
  //   event.preventDefault();

  //   try {
  //     this.setState({ loading: true, errorMessage: "", positiveMessage: "" });

  //     const { accounts, DigitalRupiah } = this.props;
  //     const { request_address, total_buy_price, total_unit } = this.state;

  //     const txhash = await DigitalRupiah.methods
  //       .approve(
  //         request_address,
  //         web3_utils.toWei(total_buy_price.toString(), "ether")
  //       )
  //       .send({
  //         from: accounts[0],
  //       });

  //     let status = await this.getStatus(status);

  //     this.setState({
  //       positiveMessage:
  //         "Transaction succeed! \n Transaction hash: " + txhash.transactionHash,
  //       status,
  //     });
  //   } catch (e) {
  //     console.log(e.message);
  //     this.setState({
  //     errorMessage: e.message.includes(`"status": false`)
  //     ? "Transaction failed. Make sure you are an active CBDC participant and fill the form correctly"
  //     : e.message,
  // });
  //   }
  //   this.setState({ loading: false });
  // };

  setOpen(boolean) {
    this.setState({ open: boolean });
  }

  renderModal() {
    const {
      open,
      loading,
      SBN_code,
      total_unit,
      total_buy_price,
      SBN_unit_price,
    } = this.state;

    const unit_price = web3_utils.fromWei(SBN_unit_price.toString(), "ether");
    const unit_price_readable = rupiahFormater.Rp.format(unit_price);
    const unit_price_terbilang = terbilang(unit_price);

    const requested_unit_price = total_buy_price / total_unit;
    const requested_unit_price_readable = rupiahFormater.Rp.format(
      requested_unit_price.toString()
    );
    const requested_unit_price_terbilang = terbilang(requested_unit_price);

    const margin = (
      ((requested_unit_price - unit_price) / unit_price) *
      100
    ).toFixed(2);

    const total_buy_price_readable = rupiahFormater.Rp.format(total_buy_price);
    const total_buy_price_terbilang = terbilang(total_buy_price);

    return (
      <Modal
        onClose={() => this.setOpen(false)}
        onOpen={() => this.setOpen(true)}
        open={open}
        trigger={
          <Button color="green" icon loading={this.state.loading}>
            <Icon name="check" />
          </Button>
        }
        dimmer={"blurring"}
      >
        <Modal.Header>Transaction Review</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Header>Trade Detail</Header>
            <Table celled>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    <b>SBN Code </b>
                  </Table.Cell>
                  <Table.Cell>{SBN_code}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>You Pay</b>
                  </Table.Cell>
                  <Table.Cell>
                    {`${total_buy_price_readable} (${total_buy_price_terbilang})`}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>You Get</b>
                  </Table.Cell>
                  <Table.Cell>{total_unit + " unit " + SBN_code}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Buy Price Per Unit</b>
                  </Table.Cell>
                  <Table.Cell>{`${requested_unit_price_readable} (${requested_unit_price_terbilang})`}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Initial Unit Price</b>
                  </Table.Cell>
                  <Table.Cell>{`${unit_price_readable} (${unit_price_terbilang})`}</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>

            <Message color="red">
              <Message.Header>TRANSACTION IS IRREVERSIBLE</Message.Header>
              <p>
                Make sure the detail is correct. <br></br>
                To proceed, press continue and sign with the connected web3
                wallet. <br></br>
                To abort, press cancel.
              </p>
            </Message>
          </Modal.Description>
          <Dimmer inverted active={loading}>
            <Loader inverted> {this.state.loadingStatus}</Loader>
          </Dimmer>
        </Modal.Content>

        <Modal.Actions>
          <Button negative onClick={() => this.setOpen(false)}>
            Cancel
          </Button>
          <Button
            content="Continue"
            labelPosition="right"
            icon="checkmark"
            onClick={async () => {
              await this.onAccept();
              this.setOpen(false);
            }}
            positive
          />
        </Modal.Actions>
      </Modal>
    );
  }

  onAccept = async () => {
    try {
      this.setState({ loading: true, errorMessage: "", positiveMessage: "" });

      const { accounts, DigitalRupiah } = this.props;
      const { request_contract, request_address, total_buy_price } = this.state;

      let tx1, tx2;

      this.setState({ loadingStatus: "Waiting DIDR Approval..." });
      await DigitalRupiah.methods
        .approve(
          request_address,
          web3_utils.toWei(total_buy_price.toString(), "ether")
        )
        .send({
          from: accounts[0],
        })
        .then(async (tx) => {
          this.setState({ loadingStatus: "Accepting Trade Request..." });
          tx1 = tx;

          tx2 = await request_contract.methods.accept().send({
            from: accounts[0],
          });
        });

      let status = await this.getStatus(status);

      this.setState({
        positiveMessage:
          "Trade succeed! Transaction hash: " +
          tx1.transactionHash +
          " and " +
          tx2.transactionHash,
        loadingStatus: "Processing transaction",
        status,
      });
    } catch (e) {
      console.log(e.message);
      let status = await this.getStatus(status);
      this.setState({ errorMessage: e.message, status });
    }
    this.setState({ loading: false });
  };

  onReject = async (event) => {
    event.preventDefault();

    try {
      this.setState({ loading: true, errorMessage: "", positiveMessage: "" });

      const { accounts } = this.props;
      const { request_contract } = this.state;

      const txhash = await request_contract.methods.reject().send({
        from: accounts[0],
      });

      let status = await this.getStatus(status);

      this.setState({
        positiveMessage:
          "Reject request succeed! Transaction hash: " + txhash.transactionHash,
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
      total_buy_price,
      total_unit,
      request_expired,
      status,
    } = this.state;

    const unit_price = web3_utils.fromWei(SBN_unit_price.toString(), "ether");
    const unit_price_readable = rupiahFormater.Rp.format(unit_price);

    const requested_unit_price = total_buy_price / total_unit;

    const requested_unit_price_readable = rupiahFormater.Rp.format(
      requested_unit_price.toString()
    );

    const margin = (
      ((requested_unit_price - unit_price) / unit_price) *
      100
    ).toFixed(2);

    const total_buy_price_readable = rupiahFormater.Rp.format(total_buy_price);

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
          <Table.Cell>{this.state.seller_name}</Table.Cell>
          <Table.Cell>{this.state.total_unit}</Table.Cell>
          <Table.Cell>{unit_price_readable}</Table.Cell>
          <Table.Cell>
            {requested_unit_price_readable} ({margin}%)
          </Table.Cell>
          <Table.Cell>{total_buy_price_readable}</Table.Cell>
          <Table.Cell>{expired_readable} WIB</Table.Cell>
          <Table.Cell>{status_readable}</Table.Cell>
          <Table.Cell>
            {status == ReadableStatus.PendingBuyer ||
            status == ReadableStatus.PendingBuyerApproval
              ? this.renderModal()
              : null}
            {status == ReadableStatus.PendingBuyer ||
            status == ReadableStatus.PendingBuyerApproval ||
            status == ReadableStatus.PendingSellerApproval ? (
              <Button
                color="red"
                icon
                onClick={this.onReject}
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

export default BuyRequestRow;
