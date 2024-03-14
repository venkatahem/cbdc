import React, { Component } from "react";

import {
  Header,
  Form,
  Input,
  Modal,
  Button,
  Dimmer,
  Table,
  Message,
  Loader,
} from "semantic-ui-react";

import getContract from "../../../lib/getContract";
import getWeb3Adresses from "../../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../../build/contracts/CBDC_Dapps.json";
import web3_utils from "web3-utils";

import Layout from "../../../components/layout";

class AdminParticipantsNew extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: undefined,
      CBDC_Dapps: undefined,
      participant: {},
      open: false,
      loading: false,
    };
  }

  static async getInitialProps(props) {
    return {
      address: props.query.address,
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

  onSubmit = async () => {
    this.setState({ loading: true, errorMessage: "", positiveMessage: "" });

    try {
      const {
        accounts,
        CBDC_Dapps,
        new_participant_name,
        new_participant_address,
      } = this.state;
      const tx = await CBDC_Dapps.methods
        .addParticipant(new_participant_address, new_participant_name)
        .send({ from: accounts[0] });

      this.setState({
        positiveMessage:
          "Add new participant completed! Transaction hash: " +
          tx.transactionHash,
      });
    } catch (e) {
      this.setState({
        errorMessage: e.message.includes(`"status": false`)
          ? "Transaction failed. Make sure you are an active CBDC participant and fill the form correctly"
          : e.message,
      });
      console.log(e.message);
    }

    this.setState({ loading: false });
  };

  checkForm = () => {
    this.setState({ errorMessage: "", positiveMessage: "" });

    const { new_participant_address, new_participant_name } = this.state;

    if (
      !(
        new_participant_address != null &&
        new_participant_address.trim() !== "" &&
        new_participant_name != null &&
        new_participant_name.trim() !== ""
      )
    ) {
      this.setState({ errorMessage: "Please fill all required fields" });
      return false;
    } else if (!web3_utils.isAddress(new_participant_address)) {
      this.setState({ errorMessage: "Address format is incorrect" });
      return false;
    } else {
      return true;
    }
  };
  setOpen(boolean) {
    this.setState({ open: boolean });
  }
  renderModal() {
    const { loading, open, new_participant_name, new_participant_address } =
      this.state;
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
            <Header>Add New Participant Detail</Header>
            <Table celled fixed>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    <b>Participant Name</b>
                  </Table.Cell>
                  <Table.Cell>{new_participant_name}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Participant Address</b>
                  </Table.Cell>
                  <Table.Cell>{new_participant_address}</Table.Cell>
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
            Add New Participant
          </Header>

          <Form error={!!this.state.errorMessage}>
            <Form.Field>
              <label> New Participant Name </label>
              <Input
                onChange={(e) => {
                  this.setState({ new_participant_name: e.target.value });
                }}
                labelPosition="left"
                type="text"
                placeholder="Participant name (e.g. Bank ABC)"
                value={this.state.new_participant_name}
              >
                <input />
              </Input>
            </Form.Field>

            <Form.Field>
              <label> New Participant Address </label>
              <Input
                onChange={(e) => {
                  this.setState({ new_participant_address: e.target.value });
                }}
                labelPosition="left"
                type="text"
                placeholder="Participant address (e.g. 0xc0ffee254729296a45a3885639AC7E10F9d54979)"
                value={this.state.new_participant_address}
              >
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
        </Layout>
      </>
    );
  }
}

export default AdminParticipantsNew;
