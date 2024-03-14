import React, { Component } from "react";
import {
  Table,
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
} from "semantic-ui-react";
import ParticipantsDropdown from "../../../components/ParticipantsDropdown";
import SBNDropdown from "../../../components/SBNDropdown";

import * as rupiahFormater from "../../../helper_function/rupiahFormater";
import terbilang from "../../../helper_function/rupiahTerbilang";
import * as unixDate from "../../../helper_function/unixDate";

import getContract from "../../../lib/getContract";
import getWeb3Adresses from "../../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../../build/contracts/CBDC_Dapps.json";
import web3_utils from "web3-utils";

import Layout from "../../../components/layout";

class AdminSBN extends Component {
  constructor(props) {
    super(props);
    const selected_SBN_detail = { total_supply: 0, BI_owned: 0, code: "" };
    this.state = {
      accounts: undefined,
      CBDC_Dapps: undefined,
      selected_SBN_detail,
      mint_amount: 0,
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

  updateSBNDetail = async () => {
    const { selected_SBN, CBDC_Dapps } = this.state;
    const SBN_contract = selected_SBN;

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

    const total_supply = await SBN_contract.methods.totalSupply().call();

    const BI_address = await CBDC_Dapps.methods.BankIndonesiaAddress().call();

    const BI_owned = await SBN_contract.methods.balanceOf(BI_address).call();

    const address = SBN_contract._address;

    const detail = {
      code,
      name,
      release_date,
      maturity_date,
      initial_unit_price,
      total_supply,
      BI_owned,
      address,
    };

    this.setState({
      selected_SBN_detail: detail,
    });
  };

  onChangeSBNDropdown = async (event, data) => {
    this.state.selected_SBN = data.value;
    await this.updateSBNDetail();
  };

  onSubmitIssuance = async () => {
    try {
      this.setState({
        loading: true,
        errorMessageIssuance: "",
        positiveMessageIssuance: "",
      });

      const { accounts, selected_SBN, selected_receiver, mint_amount } =
        this.state;

      const tx = await selected_SBN.methods
        .mint(selected_receiver.account, mint_amount)
        .send({
          from: accounts[0],
        });

      await this.updateSBNDetail();

      this.setState({
        positiveMessageIssuance:
          "SBN Issuance succeed! Transaction hash: " + tx.transactionHash,
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

      const { accounts, selected_SBN, redemption_amount } = this.state;

      const tx = await selected_SBN.methods.burn(redemption_amount).send({
        from: accounts[0],
      });

      await this.updateSBNDetail();

      this.setState({
        positiveMessageRedemption: "transaction hash: " + tx.transactionHash,
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

  renderTableSBN() {
    const { selected_SBN_detail } = this.state;
    return (
      <Table striped fixed padded size="large" basic="very">
        <Table.Body>
          <Table.Row>
            <Table.Cell>SBN Code</Table.Cell>
            <Table.Cell>{selected_SBN_detail["code"]}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>SBN Name</Table.Cell>
            <Table.Cell>{selected_SBN_detail["name"]}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>SBN Smart Contract Address</Table.Cell>
            <Table.Cell>{selected_SBN_detail["address"]}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Released Date</Table.Cell>
            <Table.Cell>
              {selected_SBN_detail["release_date"]
                ? unixDate.format_date(selected_SBN_detail["release_date"])
                : null}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Maturity Date</Table.Cell>
            <Table.Cell>
              {selected_SBN_detail["maturity_date"]
                ? unixDate.format_date(selected_SBN_detail["maturity_date"])
                : null}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Initial Unit Price</Table.Cell>
            <Table.Cell>
              {selected_SBN_detail["initial_unit_price"]
                ? rupiahFormater.Rp.format(
                    web3_utils.fromWei(
                      selected_SBN_detail["initial_unit_price"].toString(),
                      "ether"
                    )
                  )
                : null}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }

  checkForm = () => {
    this.setState({ errorMessageIssuance: "", positiveMessageIssuance: "" });

    const { selected_SBN, selected_receiver, mint_amount } = this.state;
    if (
      selected_SBN != undefined &&
      selected_receiver != undefined &&
      mint_amount > 0
    ) {
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
    const {
      selected_SBN_detail,
      selected_receiver,
      mint_amount,
      open,
      loading,
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
            <Header>Issue SBN Detail</Header>
            <Table celled>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>SBN Code</Table.Cell>
                  <Table.Cell>{selected_SBN_detail["code"]}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>SBN Name</Table.Cell>
                  <Table.Cell>{selected_SBN_detail["name"]}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Mint Amount</Table.Cell>
                  <Table.Cell>{`${rupiahFormater.whole_number.format(
                    mint_amount
                  )} unit(s)`}</Table.Cell>
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
    const { accounts, selected_SBN_detail } = this.state;

    return (
      <Layout>
        <Header as="h2" textAlign="center">
          SBN
        </Header>
        <Header as="h3">Select SBN:</Header>
        <SBNDropdown onChange={this.onChangeSBNDropdown} />
        <Segment>
          <Header as="h3" textAlign="center">
            Total Supply
          </Header>
          <Header as="h1" textAlign="center">
            {rupiahFormater.whole_number.format(
              selected_SBN_detail.total_supply
            )}
            <Header.Subheader>
              ({" "}
              {terbilang(
                selected_SBN_detail.total_supply,
                selected_SBN_detail.code
              )}{" "}
              )
            </Header.Subheader>
          </Header>

          <Header as="h3" textAlign="center">
            Total Owned by Bank Indonesia
          </Header>
          <Header as="h1" textAlign="center">
            {rupiahFormater.whole_number.format(selected_SBN_detail.BI_owned)}
            <Header.Subheader>
              ({" "}
              {terbilang(
                selected_SBN_detail.BI_owned,
                selected_SBN_detail.code
              )}{" "}
              )
            </Header.Subheader>
          </Header>
        </Segment>
        <Divider />
        {this.renderTableSBN()}
        <Divider />

        <Header as="h2" textAlign="center">
          Issuance
          <Header.Subheader>
            {" "}
            Mint {selected_SBN_detail.name} ({selected_SBN_detail.code}){" "}
          </Header.Subheader>
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
            <label> Amount to mint </label>
            <Input
              onChange={(e) => {
                this.setState({ mint_amount: e.target.value });
              }}
              labelPosition="left"
              type="number"
              min="1"
              placeholder={selected_SBN_detail.code + " Amount"}
            >
              <Label>{selected_SBN_detail.code}</Label>
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
            <label> Amount to redeem </label>
            <Input
              onChange={(e) => {
                this.setState({ redemption_amount: e.target.value });
              }}
              labelPosition="left"
              type="number"
              min="1"
              placeholder={selected_SBN_detail.code + " Amount"}
            >
              <Label>{selected_SBN_detail.code}</Label>
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

export default AdminSBN;
