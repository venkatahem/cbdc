import React, { Component } from "react";
import {
  Header,
  Divider,
  Input,
  Label,
  Form,
  Message,
  Popup,
  Modal,
  Button,
  Table,
  Loader,
  Dimmer,
} from "semantic-ui-react";
import ParticipantsDropdown from "../../components/ParticipantsDropdown";

import * as rupeeFormater from "../../helper_function/rupeeFormater";
import terbilang from "../../helper_function/rupeeTerbilang";

import getContract from "../../lib/getContract";
import getWeb3Adresses from "../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../build/contracts/CBDC_Dapps.json";
import DigitalRupee_build from "../../../build/contracts/DigitalRupee.json";
import web3_utils from "web3-utils";

import Layout from "../../components/layout";

class Transfer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: undefined,
      accounts: undefined,
      CBDC_Dapps: undefined,
      DigitalRupee: undefined,
      userBalance: 0,
      open: false,
      setOpen: false,
      transferAmount: 0,
      loading: false,
    };
  }

  async getUserBalance() {
    const { DigitalRupee, accounts } = this.state;

    try {
      const balance = await DigitalRupee.methods.balanceOf(accounts[0]).call();
      return balance;
    } catch (e) {
      return;
    }
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    if (!web3 || !accounts) return false;

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);
    if (CBDC_Dapps !== undefined) {
      const DigitalRupeeAddress = await CBDC_Dapps.methods
        .digitalRupee()
        .call();
      const DigitalRupee = await getContract(
        web3,
        DigitalRupee_build,
        DigitalRupeeAddress
      );

      this.state = {
        accounts,
        DigitalRupee,
      };

      const userBalance = await this.getUserBalance();

      this.setState({
        web3,
        accounts,
        CBDC_Dapps,
        DigitalRupee,
        userBalance,
      });
    }
  }

  onChangeParticipantsDropdown = (event, data) => {
    this.setState({
      selected_receiver: data.value,
    });
  };

  checkForm = () => {
    this.setState({ errorMessage: "", positiveMessage: "" });

    const { selected_receiver, transferAmount } = this.state;
    let userBalance = userBalance
      ? web3_utils.fromWei(userBalance, "ether")
      : "";

    if (
      selected_receiver != undefined &&
      parseInt(transferAmount) > 0 &&
      parseInt(transferAmount) <= parseInt(userBalance)
    )
      return true;
    else {
      this.setState({ errorMessage: "Please fill all required fields" });
      return false;
    }
  };

  onSubmit = async (event) => {
    try {
      this.setState({ loading: true, errorMessage: "", positiveMessage: "" });

      const { accounts, DigitalRupee, selected_receiver, transferAmount } =
        this.state;

      const destinationAddress = selected_receiver["account"];
      const txhash = await DigitalRupee.methods
        .transfer(
          destinationAddress,
          web3_utils.toWei(transferAmount.toString(), "ether")
        )
        .send({
          from: accounts[0],
        });

      const balance = await this.getUserBalance();

      this.setState({
        positiveMessage:
          "Transfer completed! \n Transaction hash: " + txhash.transactionHash,
        userBalance: balance,
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

  renderDropdown() {
    return (
      <ParticipantsDropdown
        onChange={this.onChangeParticipantsDropdown}
      ></ParticipantsDropdown>
    );
  }

  setOpen(boolean) {
    this.setState({ open: boolean });
  }
  renderModal() {
    const { open, selected_receiver, transferAmount, loading } = this.state;
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
            <Header>Transfer Detail</Header>
            <Table celled>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    <b>Receiver Address </b>
                  </Table.Cell>
                  <Table.Cell>
                    {selected_receiver ? selected_receiver.account : null}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Receiver Name</b>
                  </Table.Cell>
                  <Table.Cell>
                    {selected_receiver ? selected_receiver.name : null}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Transfer Amount</b>
                  </Table.Cell>
                  <Table.Cell>
                    {"D" + rupeeFormater.IDR.format(transferAmount)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell></Table.Cell>
                  <Table.Cell>{terbilang(transferAmount)}</Table.Cell>
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
    let { userBalance } = this.state;
    userBalance = userBalance ? web3_utils.fromWei(userBalance, "ether") : "";

    return (
      <Layout>
        <Header dividing as="h1" textAlign="center">
          TRANSFER DIGITAL RUPEE
        </Header>

        <Header as="h1" textAlign="center">
          <Header sub textAlign="center">
            Current Balance
          </Header>
          {"D" + rupeeFormater.IDR.format(userBalance)}{" "}
          <Header.Subheader>( {terbilang(userBalance)} )</Header.Subheader>
        </Header>
        <Divider />

        <Form error={!!this.state.errorMessage}>
          <Form.Field>
            <Header as="h3"> Select Receiver: </Header>
            <Popup content="Test" trigger={this.renderDropdown()} />
          </Form.Field>

          <Form.Field>
            <Header as="h3"> Input Amount: </Header>
            <Input
              onChange={(e) =>
                this.setState({ transferAmount: e.target.value })
              }
              labelPosition="left"
              type="number"
              min={1}
              max={userBalance}
              placeholder="Amount"
              required
            >
              <Label>DIDR</Label>
              <input />
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
    );
  }
}

export default Transfer;
