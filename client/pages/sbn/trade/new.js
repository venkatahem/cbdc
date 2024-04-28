import React, { Component } from "react";
import {
  Header,
  Divider,
  Input,
  Label,
  Form,
  Message,
  Table,
  Modal,
  Button,
  Dimmer,
  Loader,
} from "semantic-ui-react";
import SBNDropdown from "../../../components/SBNDropdown";
import ParticipantsDropdown from "../../../components/ParticipantsDropdown";
import DateTimePicker from "react-datetime-picker/dist/entry.nostyle";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

import * as unixDate from "../../../helper_function/unixDate";
import * as rupeeFormater from "../../../helper_function/rupeeFormater";
import terbilang from "../../../helper_function/rupeeTerbilang";

import getContract from "../../../lib/getContract";
import getWeb3Adresses from "../../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../../build/contracts/CBDC_Dapps.json";
import web3_utils from "web3-utils";

import Layout from "../../../components/layout";

class RequestsNew extends Component {
  constructor(props) {
    super(props);

    const today = new Date();
    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);

    const temp_sbn_detail = {
      initial_unit_price: 0,
    };

    this.state = {
      web3: undefined,
      accounts: undefined,
      CBDC_Dapps: undefined,
      selectedSBN: undefined,
      selected_SBN_detail: temp_sbn_detail,
      expired_datetime: tomorrow,
      expired_datetime_unix: 0,
      open: false,
      loading: false,
      loadingStatus: "Processing transaction",
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    if (!web3 || !accounts) return false;

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);

    this.onChangeCalendar(this.state.expired_datetime);

    this.setState({
      web3,
      accounts,
      CBDC_Dapps,
    });
  }

  async updateSBNDetail(SBN_contract) {
    const { accounts } = this.state;

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

    const owned = await SBN_contract.methods.balanceOf(accounts[0]).call();

    const detail = {
      code,
      name,
      release_date,
      maturity_date,
      initial_unit_price,
      owned,
    };

    this.setState({
      selected_SBN_detail: detail,
    });
  }

  onChangeSBNDropdown = async (event, data) => {
    await this.updateSBNDetail(data.value);
    this.setState({
      selectedSBN: data.value,
    });
  };

  onChangeCalendar = (datetime) => {
    datetime.setMinutes(0, 0);
    // datetime timezone based on machine's timezone

    // get timezone difference relative to utc+0
    const diff = datetime.getTimezoneOffset();

    // same timestamp (date, hours), but set to utc+0
    const MS_PER_MINUTE = 60000;
    const adjusted_timezone_utc_0 = new Date(
      datetime.getTime() - diff * MS_PER_MINUTE
    );

    // same timestamp (date, hours), but set to utc+7
    const adjusted_timezone_utc_7 = new Date(
      adjusted_timezone_utc_0.getTime() - 7 * 60 * MS_PER_MINUTE
    );

    try {
      // set minutes and seconds to zero
      this.setState({
        expired_datetime: datetime,
        expired_datetime_unix: Math.floor(
          adjusted_timezone_utc_7.getTime() / 1000
        ),
      });
    } catch (e) {}
  };

  onChangeParticipantsDropdown = (event, data) => {
    this.setState({
      selected_buyer: data.value,
    });
  };

  onSubmit = async () => {
    let tx1, tx2;
    try {
      this.setState({ loading: true, errorMessage: "", positiveMessage: "" });

      const {
        CBDC_Dapps,
        accounts,
        selectedSBN,
        total,
        unitAmount,
        expired_datetime_unix,
        selected_buyer,
      } = this.state;

      this.setState({ loadingStatus: "Creating Sell Request" });

      await CBDC_Dapps.methods
        .createSellRequest(
          selectedSBN._address,
          selected_buyer.account,
          unitAmount,
          web3_utils.toWei(total.toString(), "ether"),
          expired_datetime_unix
        )
        .send({
          from: accounts[0],
        })
        .then(async (tx) => {
          this.setState({ loadingStatus: "Waiting SBN Approval" });
          tx1 = tx;

          const new_request_address =
            tx1.events.NewRequest.returnValues.requestAddress;

          tx2 = await selectedSBN.methods
            .approve(new_request_address, unitAmount)
            .send({ from: accounts[0] });
        });

      this.setState({
        positiveMessage:
          "New sell request created! Transaction hash: " +
          tx1.transactionHash +
          " and " +
          tx2.transactionHash,
        loadingStatus: "Processing transaction",
      });
    } catch (e) {
      console.log(e.Error);
      if (tx1 != null)
        this.setState({
          errorMessage:
            "Request created, but SBN access not approved yet. Approve your SBN access on the Trade page",
        });
      else
        this.setState({
          errorMessage: e.message.includes(`"status": false`)
            ? "Transaction failed. Make sure you are an active CBDC participant and fill the form correctly"
            : e.message,
        });
    }

    this.setState({ loading: false });
  };

  renderTableSBN() {
    const { selected_SBN_detail } = this.state;
    return (
      <Table striped fixed collapsing celled size="large" columns={16}>
        <Table.Body>
          <Table.Row>
            <Table.Cell width={5}>
              {" "}
              <b>SBN Code </b>
            </Table.Cell>
            <Table.Cell width={8}>
              {selected_SBN_detail["code"] ? selected_SBN_detail["code"] : "-"}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              {" "}
              <b>SBN Name </b>
            </Table.Cell>
            <Table.Cell>
              {selected_SBN_detail["name"] ? selected_SBN_detail["name"] : "-"}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              {" "}
              <b>Released Date</b>
            </Table.Cell>
            <Table.Cell>
              {selected_SBN_detail["release_date"]
                ? unixDate.format_date(selected_SBN_detail["release_date"])
                : "-"}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              {" "}
              <b> Maturity Date</b>
            </Table.Cell>
            <Table.Cell>
              {selected_SBN_detail["maturity_date"]
                ? unixDate.format_date(selected_SBN_detail["maturity_date"])
                : "-"}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              {" "}
              <b> Initial Unit Price</b>
            </Table.Cell>
            <Table.Cell>
              {selected_SBN_detail["initial_unit_price"]
                ? rupeeFormater.Rp.format(
                    web3_utils.fromWei(
                      selected_SBN_detail["initial_unit_price"].toString(),
                      "ether"
                    )
                  )
                : "-"}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              {" "}
              <b> Owned unit</b>
            </Table.Cell>
            <Table.Cell>
              {selected_SBN_detail["owned"]
                ? selected_SBN_detail["owned"] + " unit(s)"
                : "-"}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }

  checkForm = () => {
    this.setState({ errorMessage: "", positiveMessage: "" });

    const {
      CBDC_Dapps,
      accounts,
      selectedSBN,
      total,
      unitAmount,
      expired_datetime_unix,
      selected_buyer,
      owned,
    } = this.state;

    if (
      CBDC_Dapps != undefined &&
      accounts != undefined &&
      selectedSBN != undefined &&
      selected_buyer != undefined &&
      total > 0 &&
      unitAmount > 0 &&
      expired_datetime_unix > 0
    ) {
      return true;
    } else {
      this.setState({ errorMessage: "Please fill all required fields" });
      return false;
    }
  };

  setOpen(boolean) {
    this.setState({ open: boolean });
  }

  renderModal() {
    const { open, loading } = this.state;

    const {
      selected_SBN_detail,
      total,
      unitAmount,
      expired_datetime_unix,
      selected_buyer,
    } = this.state;

    const unit_price = web3_utils.fromWei(
      selected_SBN_detail["initial_unit_price"].toString(),
      "ether"
    );
    const unit_price_readable = rupeeFormater.Rp.format(unit_price);
    const unit_price_terbilang = terbilang(unit_price);

    const requested_unit_price = total / unitAmount;
    const requested_unit_price_readable = rupeeFormater.Rp.format(
      requested_unit_price.toString()
    );
    const requested_unit_price_terbilang = terbilang(requested_unit_price);

    const total_readable = rupeeFormater.Rp.format(total);
    const total_terbilang = terbilang(total);

    const expired_readable = unixDate.format_timestamp(expired_datetime_unix);

    return (
      <Modal
        onClose={() => this.setOpen(false)}
        onOpen={() => {
          if (this.checkForm()) this.setOpen(true);
        }}
        open={open}
        trigger={<Button primary>Submit</Button>}
        dimmer={"blurring"}
      >
        <Modal.Header>Transaction Review</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Header>New Sell Request Detail</Header>
            <Table celled>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    <b>You Sell</b>
                  </Table.Cell>
                  <Table.Cell>{`${unitAmount} unit(s) of ${selected_SBN_detail["code"]}`}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>You Get</b>
                  </Table.Cell>
                  <Table.Cell>{`${total_readable} (${total_terbilang})`}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Sell Price Per Unit</b>
                  </Table.Cell>
                  <Table.Cell>{`${requested_unit_price_readable} (${requested_unit_price_terbilang})`}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Initial Unit Price</b>
                  </Table.Cell>
                  <Table.Cell>{`${unit_price_readable} (${unit_price_terbilang})`}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Request Will Expire On</b>
                  </Table.Cell>
                  <Table.Cell>{`${expired_readable} WIB`}</Table.Cell>
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
              await this.onSubmit();
              this.setOpen(false);
            }}
            positive
          />
        </Modal.Actions>
      </Modal>
    );
  }

  render() {
    const { selected_SBN_detail } = this.state;

    return (
      <>
        <Layout>
          <Header as="h1" textAlign="center">
            Create New SBN Sell Request
          </Header>
          <Divider />

          <Form>
            <Form.Field>
              <Header as="h3"> Choose SBN to sell: </Header>
              <SBNDropdown onChange={this.onChangeSBNDropdown} />
            </Form.Field>

            <Form.Field>
              <Header as="h4"> SBN Detail </Header>
              {this.renderTableSBN()}
            </Form.Field>

            <Form.Field>
              <Header as="h3"> Number of SBN unit to sell: </Header>
              <Input
                onChange={(e) => {
                  const total = this.state.unitPrice * e.target.value;
                  this.setState({ unitAmount: e.target.value, total });
                }}
                labelPosition="right"
                type="number"
                min="1"
                max={selected_SBN_detail["owned"]}
                placeholder={"Unit Amount"}
              >
                <input />
                <Label>{selected_SBN_detail["code"]}</Label>
              </Input>
            </Form.Field>

            <Form.Field>
              <Header as="h3"> Sell price per unit:</Header>
              <Input
                onChange={(e) => {
                  const total = this.state.unitAmount * e.target.value;
                  this.setState({ unitPrice: e.target.value, total });
                }}
                labelPosition="left"
                type="number"
                min="1"
                placeholder="Amount"
              >
                <Label>DINR</Label>
                <input />
              </Input>
            </Form.Field>
            <p>
              Price per unit : {"  "}
              {this.state.unitPrice
                ? rupeeFormater.Rp.format(this.state.unitPrice)
                : 0}
            </p>
            <p>
              Total :{"  "}
              {this.state.total ? rupeeFormater.Rp.format(this.state.total) : 0}
            </p>

            <Form.Field>
              <Header as="h3"> Select Buyer: </Header>
              <ParticipantsDropdown
                onChange={this.onChangeParticipantsDropdown}
              ></ParticipantsDropdown>
            </Form.Field>

            <Form.Field>
              <Header as="h3"> Expired date: </Header>
            </Form.Field>
          </Form>
          <DateTimePicker
            onChange={this.onChangeCalendar}
            value={this.state.expired_datetime}
            disableClock={true}
            format="dd MMMM y HH:00 WIB"
            maxDetail="hour"
            minDate={new Date()}
            maxDate={new Date(new Date().setDate(new Date().getDate() + 1))}
            clearIcon={null}
          ></DateTimePicker>

          <Form error={!!this.state.errorMessage}>
            <Form.Field></Form.Field>
            <Message
              error
              header="There was some errors with your submission"
              content={this.state.errorMessage}
            />
            <Message
              positive
              hidden={!this.state.positiveMessage}
              header="Success!!"
              content={this.state.positiveMessage}
              style={{ "word-break": "break-all" }}
            />
            {this.renderModal()}
          </Form>
          <Divider />
        </Layout>
      </>
    );
  }
}

export default RequestsNew;
