import React, { Component } from "react";
import { Table, Button, Modal, Dimmer, Loader } from "semantic-ui-react";

import getContract from "../lib/getContract";
import getWeb3Adresses from "../lib/getWeb3Address";
import CBDC_Dapps_build from "../../build/contracts/CBDC_Dapps.json";

import Router from "next/router";

import {
  ParticipantStatus,
  reverseParticipantStatus,
} from "../helper_function/ParticipantStatus.js";

class ParticipantsRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      loading: false,
    };
  }

  onRemove = async () => {
    try {
      this.setState({
        loading: true,
        errorMessage: "",
        positiveMessage: "",
      });
      const { accounts, CBDC_Dapps, participant, index, updateParticipants } =
        this.props;

      const check_address = await CBDC_Dapps.methods
        .participantAddresses(index)
        .call();

      if (check_address == participant.account) {
        const tx = await CBDC_Dapps.methods
          .removeParticipant(index)
          .send({ from: accounts[0] });

        await updateParticipants();
        this.setState({
          positiveMessage: "transaction hash: " + tx.transactionHash,
        });
      }
    } catch (e) {
      this.setState({
        errorMessage: e.message.includes(`"status": false`)
          ? "Transaction failed. Make sure you are an active CBDC participant and fill the form correctly"
          : e.message,
      });
    }
    this.setState({ loading: false });
  };

  setOpen(boolean) {
    this.setState({ open: boolean });
  }
  renderModal() {
    const { open, loading } = this.state;
    const { participant } = this.props;
    return (
      <Modal
        onClose={() => this.setOpen(false)}
        onOpen={() => this.setOpen(true)}
        open={open}
        trigger={<Button negative>Remove</Button>}
        dimmer={"blurring"}
      >
        <Modal.Header>Warning</Modal.Header>
        <Modal.Content>
          <Modal.Description>{`Are you sure to remove ${participant.name} with account number ${participant.account} from the registered participant?`}</Modal.Description>
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
              await this.onRemove();
              this.setOpen(false);
            }}
            positive
          />
        </Modal.Actions>
      </Modal>
    );
  }

  render() {
    const { participant } = this.props;
    return (
      <Table.Row
        error={participant.status == reverseParticipantStatus.NotActive}
      >
        <Table.Cell>{participant.name}</Table.Cell>
        <Table.Cell>{participant.account}</Table.Cell>
        <Table.Cell>{ParticipantStatus[participant.status]}</Table.Cell>
        <Table.Cell>
          <a href={Router.pathname + "/" + this.props.participant.account}>
            <Button content="Edit" color="blue" />
          </a>
          {this.renderModal()}
        </Table.Cell>
      </Table.Row>
    );
  }
}

class ParticipantsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: undefined,
      CBDC_Dapps: undefined,
      accounts: [],
      participants: undefined,
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);

    this.state.CBDC_Dapps = CBDC_Dapps;

    const participants = await this.updateParticipants();

    this.setState({ web3, accounts, CBDC_Dapps, participants });
  }

  updateParticipants = async () => {
    const { CBDC_Dapps } = this.state;

    const participantAddresses = await CBDC_Dapps.methods
      .getAllParticipantAddresses()
      .call();

    const participants = await Promise.all(
      Array(participantAddresses.length)
        .fill()
        .map((content, index) => {
          return CBDC_Dapps.methods
            .addressToParticipant(participantAddresses[index])
            .call();
        })
    );

    this.setState({ participants });
    return participants;
  };

  renderRow() {
    return this.state.participants.map((participants, index) => {
      return (
        <ParticipantsRow
          key={index}
          index={index}
          participant={this.state.participants[index]}
          CBDC_Dapps={this.state.CBDC_Dapps}
          accounts={this.state.accounts}
          updateParticipants={this.updateParticipants}
        ></ParticipantsRow>
      );
    });
  }

  render() {
    const { participants } = this.state;

    return (
      <>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Address</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Action</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          {participants ? this.renderRow() : null}
        </Table>
      </>
    );
  }
}

export default ParticipantsTable;
