import React, { Component } from "react";

import {
  Header,
  Form,
  Input,
  Dropdown,
  Modal,
  Loader,
  Dimmer,
  Table,
  Message,
  Button,
} from "semantic-ui-react";

import getContract from "../../../lib/getContract";
import getWeb3Adresses from "../../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../../build/contracts/CBDC_Dapps.json";
import web3_utils, { jsonInterfaceMethodToString } from "web3-utils";

import Layout from "../../../components/layout";

import {
  ParticipantStatus,
  reverseParticipantStatus,
} from "../../../helper_function/ParticipantStatus";

const participantOptions = [
  {
    key: 1,
    text: ParticipantStatus[1],
    value: 1,
  },
  {
    key: 2,
    text: ParticipantStatus[2],
    value: 2,
  },
];

class AdminParticipantsEdit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accounts: undefined,
      CBDC_Dapps: undefined,
      participant: { name: "", status: 0 },
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

    const { address } = this.props;

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);

    const BI_address = await CBDC_Dapps.methods.BankIndonesiaAddress().call();

    const participant = await CBDC_Dapps.methods
      .addressToParticipant(address)
      .call();

    const new_participant_name = participant.name;
    const new_participant_status = participant.status;

    this.setState({
      web3,
      accounts,
      CBDC_Dapps,
      participant,
      new_participant_name,
      new_participant_status,
      BI_address,
    });
  }

  onSubmit = async () => {
    this.setState({ loading: true, errorMessage: "", positiveMessage: "" });

    try {
      const {
        accounts,
        CBDC_Dapps,
        participant,
        new_participant_name,
        new_participant_status,
      } = this.state;
      const tx = await CBDC_Dapps.methods
        .editParticipant(
          participant.account,
          new_participant_name,
          new_participant_status
        )
        .send({ from: accounts[0] });

      const new_participant = await CBDC_Dapps.methods
        .addressToParticipant(this.props.address)
        .call();

      this.setState({
        positiveMessage:
          "Edit participant completed! Transaction hash: " + tx.transactionHash,
        participant: new_participant,
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

    const { new_participant_name, new_participant_status } = this.state;

    if (
      !(
        new_participant_name != null &&
        new_participant_name.trim() !== "" &&
        new_participant_status != null
      )
    ) {
      this.setState({ errorMessage: "Please fill all required fields" });
      return false;
    } else {
      return true;
    }
  };
  setOpen(boolean) {
    this.setState({ open: boolean });
  }
  renderModal() {
    const {
      loading,
      open,
      participant,
      new_participant_name,
      new_participant_status,
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
            <Header>Edit Participant Detail</Header>
            <Table celled fixed>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    <b>Participant's Current Name</b>
                  </Table.Cell>
                  <Table.Cell>{participant.name}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Participant's New Name</b>
                  </Table.Cell>
                  <Table.Cell>{new_participant_name}</Table.Cell>
                </Table.Row>

                <Table.Row>
                  <Table.Cell>
                    <b>Participant's Current Status</b>
                  </Table.Cell>
                  <Table.Cell>
                    {ParticipantStatus[participant.status]}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <b>Participant's New Status</b>
                  </Table.Cell>
                  <Table.Cell>
                    {ParticipantStatus[new_participant_status]}
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
    const { participant } = this.state;
    return (
      <>
        <Layout>
          <Header as="h2" textAlign="center">
            Edit Participant
          </Header>

          <Form error={!!this.state.errorMessage}>
            <Form.Field>
              <label> Participant Address </label>
              <p> {participant.account}</p>
            </Form.Field>
            <Form.Field>
              <label> Participant's Current Name </label>
              <p> {participant.name}</p>
            </Form.Field>
            <Form.Field>
              <label> Participant's Current Status </label>
              <p> {ParticipantStatus[participant.status]}</p>
            </Form.Field>
            <Form.Field>
              <label> New Name </label>
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
              <label> New Status </label>
              <Dropdown
                placeholder="Select Status"
                fluid
                selection
                options={participantOptions}
                value={parseInt(this.state.new_participant_status)}
                onChange={(event, data) => {
                  this.setState({
                    new_participant_status: data.value,
                  });
                }}
              />
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

export default AdminParticipantsEdit;
