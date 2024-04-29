import React, { Component } from "react";
import {
  Form,
  Input,
  Label,
  Header,
  Message,
  Modal,
  Table,
  Dimmer,
  Loader,
  Button,
} from "semantic-ui-react";

import DatePicker from "react-date-picker/dist/entry.nostyle";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

import getContract from "../../../lib/getContract";
import getWeb3Adresses from "../../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../../build/contracts/CBDC_Dapps.json";
import web3_utils from "web3-utils";

import * as rupeeFormater from "../../../helper_function/rupeeFormater";
import { format_date } from "../../../helper_function/unixDate";

import Layout from "../../../components/layout";

class AdminSBNNew extends Component {
  constructor(props) {
    const now_date_midnight = new Date(new Date().setUTCHours(17, 0, 0));
    const now_year = now_date_midnight.getFullYear();
    const next_2_years_midnight = new Date(
      new Date(now_date_midnight).setFullYear(now_year + 2)
    );
    const release_date_unix = Math.floor(now_date_midnight.getTime() / 1000);
    const maturity_date_unix = Math.floor(
      next_2_years_midnight.getTime() / 1000
    );
    super(props);
    this.state = {
      accounts: undefined,
      CBDC_Dapps: undefined,
      release_date: now_date_midnight,
      maturity_date: next_2_years_midnight,
      release_date_unix,
      maturity_date_unix,
      loading: false,
      open: false,
      sbn_code: "",
      sbn_name: "",
      unit_price: 0,
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    if (!web3 || !accounts) return false;

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);

    this.setState({
      web3,
      accounts,
      CBDC_Dapps,
    });
  }

  onChangeReleaseDate = (date) => {
    try {
      this.setState({
        release_date: date,
        release_date_unix: Math.floor(date.setUTCHours(17) / 1000),
      });
    } catch (e) {}
  };

  onChangeMaturityDate = (date) => {
    try {
      this.setState({
        maturity_date: date,
        maturity_date_unix: Math.floor(date.setUTCHours(17) / 1000),
      });
    } catch (e) {}
  };

  onSubmit = async () => {
    try {
      this.setState({ loading: true, errorMessage: "", positiveMessage: "" });

      const {
        accounts,
        CBDC_Dapps,
        sbn_code,
        sbn_name,
        unit_price,
        release_date_unix,
        maturity_date_unix,
      } = this.state;

      const tx = await CBDC_Dapps.methods
        .createSBN(
          sbn_name,
          sbn_code,
          web3_utils.toWei(unit_price.toString(), "ether"),
          release_date_unix,
          maturity_date_unix
        )
        .send({
          from: accounts[0],
        });

      this.setState({
        positiveMessage:
          "New SBN created! Transaction hash: " + tx.transactionHash,
      });
    } catch (e) {
      this.setState({
        errorMessage: e.message.includes(`"status": false`)
          ? "Transaction failed. Make sure you are an active CBDC participant and fill the form correctly"
          : e.message,
      });
    }

    this.setState({ loading: false });
  };

  checkForm = () => {
    this.setState({ errorMessage: "", positiveMessage: "" });
    const {
      sbn_code,
      sbn_name,
      unit_price,
      release_date_unix,
      maturity_date_unix,
    } = this.state;

    if (
      sbn_code != null &&
      sbn_code.trim() !== "" &&
      sbn_name != null &&
      sbn_name.trim() !== "" &&
      unit_price > 0 &&
      maturity_date_unix > 0 &&
      release_date_unix > 0 &&
      release_date_unix < maturity_date_unix
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
    const {
      loading,
      open,
      sbn_code,
      sbn_name,
      unit_price,
      release_date_unix,
      maturity_date_unix,
    } = this.state;
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
            <Header>Create New SBN Detail</Header>
            <Table celled>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    <b>SBN Code</b>
                  </Table.Cell>
                  <Table.Cell>{sbn_code}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>SBN Name</b>
                  </Table.Cell>
                  <Table.Cell>{sbn_name}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Unit Price</b>
                  </Table.Cell>
                  <Table.Cell>{rupeeFormater.Rp.format(unit_price)}</Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell>
                    <b>Release Date</b>
                  </Table.Cell>
                  <Table.Cell>{format_date(release_date_unix)}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Maturity Date</b>
                  </Table.Cell>
                  <Table.Cell>{format_date(maturity_date_unix)}</Table.Cell>
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
            <Loader inverted> Processing Transaction</Loader>
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
    return (
      <>
        <Layout>
          <Header as="h2" textAlign="center">
            Add New SBN
          </Header>
          <Form>
            <Form.Field>
              <label> SBN Code </label>
              <Input
                onChange={(e) => {
                  this.setState({ sbn_code: e.target.value });
                }}
                labelPosition="left"
                type="text"
                placeholder="SBN Code (e.g. ST008)"
              >
                <input />
              </Input>
            </Form.Field>
            <Form.Field>
              <label> SBN Name </label>
              <Input
                onChange={(e) => {
                  this.setState({ sbn_name: e.target.value });
                }}
                labelPosition="left"
                type="text"
                placeholder="SBN Name (e.g. Retail Bond 008)"
              >
                <input />
              </Input>
            </Form.Field>
            <Form.Field>
              <label> Initial unit price </label>
              <Input
                onChange={(e) => {
                  this.setState({ unit_price: e.target.value });
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
          </Form>
          <Form>
            <Form.Field></Form.Field>
            <Form.Field>
              <label> Release Date </label>
            </Form.Field>
          </Form>
          <DatePicker
            value={this.state.release_date}
            onChange={this.onChangeReleaseDate}
            format="dd MMMM y 00:00 WIB"
            clearIcon={null}
          ></DatePicker>

          <Form>
            <Form.Field></Form.Field>
            <Form.Field>
              <label> Maturity Date </label>
            </Form.Field>
          </Form>
          <DatePicker
            value={this.state.maturity_date}
            onChange={this.onChangeMaturityDate}
            minDate={this.state.release_date}
            format="dd MMMM y 00:00 WIB"
            clearIcon={null}
          ></DatePicker>
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
        </Layout>
      </>
    );
  }
}

export default AdminSBNNew;
