import React, { Component } from "react";
import {
  Form,
  Input,
  Label,
  Header,
  Divider,
  Segment,
  Message,
  Modal,
  Dimmer,
  Button,
  Loader,
  Table,
} from "semantic-ui-react";
import ParticipantsDropdown from "../../../components/ParticipantsDropdown";

import * as rupiahFormater from "../../../helper_function/rupiahFormater";
import terbilang from "../../../helper_function/rupiahTerbilang";

import getContract from "../../../lib/getContract";
import getWeb3Adresses from "../../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../../build/contracts/CBDC_Dapps.json";
import DigitalRupiah_build from "../../../../build/contracts/DigitalRupiah.json";
import web3_utils from "web3-utils";

import Layout from "../../../components/layout";

class AdminDigitalRupiah extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accounts: undefined,
      CBDC_Dapps: undefined,
      DigitalRupiah: undefined,
      total_supply: 0,
      BI_owned: 0,
      mint_amount: 0,
      open: false,
      loading: false,
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    if (!web3 || !accounts) return false;

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);

    if (CBDC_Dapps !== undefined) {
      const DigitalRupiahAddress = await CBDC_Dapps.methods
        .digitalRupiah()
        .call();

      const DigitalRupiah = await getContract(
        web3,
        DigitalRupiah_build,
        DigitalRupiahAddress
      );

      this.state.DigitalRupiah = DigitalRupiah;
      this.state.CBDC_Dapps = CBDC_Dapps;

      const BI_owned = await this.updateBIOwned();
      const total_supply = await this.updateTotalSupply();

      this.setState({
        accounts,
        DigitalRupiah,
        total_supply,
        BI_owned,
      });
    }
  }

  updateBIOwned = async () => {
    const { CBDC_Dapps, DigitalRupiah } = this.state;
    const BI_address = await CBDC_Dapps.methods.BankIndonesiaAddress().call();
    const BI_owned = web3_utils.fromWei(
      await DigitalRupiah.methods.balanceOf(BI_address).call(),
      "ether"
    );
    this.state.BI_owned = BI_owned;

    return BI_owned;
  };

  updateTotalSupply = async () => {
    const { DigitalRupiah } = this.state;
    const total_supply = web3_utils.fromWei(
      (await DigitalRupiah.methods.totalSupply().call()).toString(),
      "ether"
    );
    this.state.total_supply = total_supply;

    return total_supply;
  };

  onSubmitIssuance = async () => {
    try {
      this.setState({
        loading: true,
        errorMessageIssuance: "",
        positiveMessageIssuance: "",
      });

      const { accounts, DigitalRupiah, selected_receiver, mint_amount } =
        this.state;

      const tx = await DigitalRupiah.methods
        .mint(
          selected_receiver.account,
          web3_utils.toWei(mint_amount.toString(), "ether")
        )
        .send({
          from: accounts[0],
        });

      await this.updateTotalSupply();
      await this.updateBIOwned();

      this.setState({
        positiveMessageIssuance:
          "Digital Rupiah Issuance completed! Transaction hash: " +
          tx.transactionHash,
      });
    } catch (e) {
      console.log(e.message);

      this.setState({
        errorMessageIssuance: e.message.includes(`"status": false`)
          ? "Transaction failed. Make sure you are an active CBDC participant and fill the form correctly"
          : e.message,
      });
    }

    this.setState({ loading: false });
  };

  onSubmitRedemption = async (event) => {
    event.preventDefault();

    try {
      this.setState({
        loading: true,
        errorMessageRedemption: "",
        positiveMessageRedemption: "",
      });

      const { accounts, DigitalRupiah, redemption_amount } = this.state;

      const tx = await DigitalRupiah.methods
        .burn(web3_utils.toWei(redemption_amount.toString(), "ether"))
        .send({
          from: accounts[0],
        });

      await this.updateTotalSupply();
      await this.updateBIOwned();

      this.setState({
        positiveMessageRedemption:
          "Digital Rupiah redemption completed! Transaction hash: " +
          tx.transactionHash,
      });
    } catch (e) {
      console.log(e.message);

      this.setState({
        errorMessageRedemption: e.message.includes(`"status": false`)
          ? "Transaction failed. Make sure you are an active CBDC participant and fill the form correctly"
          : e.message,
      });
    }

    this.setState({ loading: false });
  };

  checkForm = () => {
    this.setState({ errorMessageIssuance: "", positiveMessageIssuance: "" });

    const { selected_receiver, mint_amount } = this.state;
    if (selected_receiver != undefined && mint_amount > 0) {
      return true;
    } else {
      this.setState({
        errorMessageIssuance: "Please fill all required fields",
      });
      return false;
    }
  };
  setOpen(boolean) {
    this.setState({ open: boolean });
  }
  renderModal() {
    const { selected_receiver, mint_amount, open, loading } = this.state;
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
            <Header>Issue Digital Rupiah Detail</Header>
            <Table celled>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>Mint Amount</Table.Cell>
                  <Table.Cell>{`${rupiahFormater.Rp.format(
                    mint_amount
                  )}`}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Receiver Address</Table.Cell>
                  <Table.Cell>
                    {selected_receiver ? selected_receiver.account : ""}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Receiver Name</Table.Cell>
                  <Table.Cell>
                    {selected_receiver ? selected_receiver.name : ""}
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
              await this.onSubmitIssuance();
              this.setOpen(false);
            }}
            positive
          />
        </Modal.Actions>
      </Modal>
    );
  }

  render() {
    const { accounts, total_supply, BI_owned } = this.state;
    return (
      <Layout>
        <Header as="h2" textAlign="center">
          Digital Rupiah
        </Header>
        <Segment>
          <Header as="h3" textAlign="center">
            Total Supply
          </Header>
          <Header as="h1" textAlign="center">
            {"D" + rupiahFormater.IDR.format(total_supply)}{" "}
            <Header.Subheader>( {terbilang(total_supply)} )</Header.Subheader>
          </Header>

          <Header as="h3" textAlign="center">
            Total Owned by Bank Indonesia
          </Header>
          <Header as="h1" textAlign="center">
            {"D" + rupiahFormater.IDR.format(BI_owned)}{" "}
            <Header.Subheader>( {terbilang(BI_owned)} )</Header.Subheader>
          </Header>
        </Segment>
        <Divider />
        <Header as="h2" textAlign="center">
          Issuance
          <Header.Subheader> Mint Digital Rupiah</Header.Subheader>
        </Header>

        <Form error={!!this.state.errorMessageIssuance}>
          <Form.Field>
            <label> Select Receiver </label>
            <ParticipantsDropdown
              onChange={(event, data) => {
                this.setState({
                  selected_receiver: data.value,
                });
              }}
              includeSelf={true}
            />
          </Form.Field>

          <Form.Field>
            <label> Amount of Digital Rupiah to mint </label>
            <Input
              onChange={(e) => {
                this.setState({ mint_amount: e.target.value });
              }}
              labelPosition="left"
              type="number"
              min="1"
              placeholder={"Digital Rupiah Amount"}
            >
              <Label>DIDR</Label>
              <input />
            </Input>
          </Form.Field>

          <Message
            error
            header="There was some errors with your submission"
            content={this.state.errorMessageIssuance}
          />
          <Message
            positive
            hidden={!this.state.positiveMessageIssuance}
            header="Success!!"
            content={this.state.positiveMessageIssuance}
            style={{ "word-break": "break-all" }}
          />

          {this.renderModal()}
        </Form>
        {/* <Divider />
        <Header as="h2" textAlign="center">
          Redemption
          <Header.Subheader> Redeem Digital Rupiah</Header.Subheader>
        </Header>
        <Form
          onSubmit={this.onSubmitRedemption}
          error={!!this.state.errorMessageRedemption}
        >
          <Form.Field>
            <label> Amount of Digital Rupiah to redeem </label>
            <Input
              onChange={(e) => {
                this.setState({ redemption_amount: e.target.value });
              }}
              labelPosition="left"
              type="number"
              min="1"
              placeholder={"Digital Rupiah Amount"}
            >
              <Label>DIDR</Label>
              <input />
            </Input>
          </Form.Field>
          <Message
            error
            header="There was some errors with your submission"
            content={this.state.errorMessageRedemption}
          />
          <Message
            positive
            hidden={!this.state.positiveMessageRedemption}
            header="Success!!"
            content={this.state.positiveMessageRedemption}
            style={{ "word-break": "break-all" }}
          />
          <Form.Button primary loading={this.state.loading}>
            Submit
          </Form.Button>
        </Form> */}
      </Layout>
    );
  }
}

export default AdminDigitalRupiah;
