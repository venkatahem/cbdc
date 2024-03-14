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
import SBNDropdown from "../../components/SBNDropdown";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

import * as unixDate from "../../helper_function/unixDate";
import * as rupiahFormater from "../../helper_function/rupiahFormater";
import terbilang from "../../helper_function/rupiahTerbilang";

import getContract from "../../lib/getContract";
import getWeb3Adresses from "../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../build/contracts/CBDC_Dapps.json";
import web3_utils from "web3-utils";

import Layout from "../../components/layout";

class SBNTransfer extends Component {
  constructor(props) {
    super(props);
    const temp_sbn_detail = { initial_unit_price: 0 };
    this.state = {
      web3: undefined,
      accounts: undefined,
      CBDC_Dapps: undefined,
      selectedSBN: undefined,
      selected_SBN_detail: temp_sbn_detail,
      open: false,
      loading: false,
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

  onSubmit = async () => {
    try {
      this.setState({ loading: true, errorMessage: "", positiveMessage: "" });

      const { accounts, selectedSBN, unitAmount } = this.state;

      const tx = await selectedSBN.methods.redeem(unitAmount).send({
        from: accounts[0],
      });

      this.setState({
        positiveMessage:
          "Redeem completed! Transaction hash: " + tx.transactionHash,
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
                ? rupiahFormater.Rp.format(
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
      unitAmount,
      selected_SBN_detail,
    } = this.state;

    console.log(this.state);

    if (
      CBDC_Dapps != undefined &&
      accounts != undefined &&
      selectedSBN != undefined &&
      parseInt(unitAmount) > 0 &&
      parseInt(unitAmount) <= parseInt(selected_SBN_detail["owned"])
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

    const { unitAmount, selected_SBN_detail } = this.state;

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
            <Header>Redeem SBN Detail</Header>
            <Table celled>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    <b>Redeem Amount</b>
                  </Table.Cell>
                  <Table.Cell>
                    {`${rupiahFormater.whole_number.format(
                      unitAmount
                    )} unit of ${selected_SBN_detail["code"]}`}
                  </Table.Cell>
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
    const { selected_SBN_detail } = this.state;

    return (
      <>
        <Layout>
          <Header dividing as="h1" textAlign="center">
            REDEEM SBN
          </Header>

          <Form error={!!this.state.errorMessage}>
            <Form.Field>
              <Header as="h3"> Choose SBN to redeem:</Header>
              <SBNDropdown onChange={this.onChangeSBNDropdown} />
            </Form.Field>

            <Form.Field>
              <Header as="h4">SBN Detail </Header>
              {this.renderTableSBN()}
            </Form.Field>

            <Form.Field>
              <Header as="h3"> Number of SBN unit to redeem:</Header>

              <Input
                onChange={(e) => {
                  this.setState({ unitAmount: e.target.value });
                }}
                labelPosition="right"
                type="number"
                min={1}
                max={selected_SBN_detail["owned"]}
                placeholder={"Unit Amount"}
              >
                <input />
                <Label>{selected_SBN_detail["code"]}</Label>
              </Input>
            </Form.Field>

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

export default SBNTransfer;
