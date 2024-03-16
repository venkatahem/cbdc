import React, { Component } from "react";
import {
  Header,
  Divider,
  Button,
  Table,
  Icon,
  Popup,
  Grid,
  Segment,
  Message,
  Rail,
  Sticky,
  Confirm,
} from "semantic-ui-react";
import SellRequestRow from "../../../components/SellRequestRow";
import BuyRequestRow from "../../../components/BuyRequestRow";

import * as rupeeFormater from "../../../helper_function/rupeeFormater";
import terbilang from "../../../helper_function/rupeeTerbilang";

import getContract from "../../../lib/getContract";
import getWeb3Adresses from "../../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../../build/contracts/CBDC_Dapps.json";
import DigitalRupee_build from "../../../../build/contracts/DigitalRupee.json";
import web3_utils from "web3-utils";

import Layout from "../../../components/layout";

class Requests extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: undefined,
      accounts: undefined,
      CBDC_Dapps: undefined,
      DigitalRupee: undefined,
      userBalance: 0,
      participantAddresses: [],
      userSellRequests: [],
      userBuyRequests: [],
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    if (!web3 || !accounts) return false;

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);

    const DigitalRupeeAddress = await CBDC_Dapps.methods
      .digitalRupee()
      .call();
    const DigitalRupee = await getContract(
      web3,
      DigitalRupee_build,
      DigitalRupeeAddress
    );

    const participantAddresses = await CBDC_Dapps.methods
      .getAllParticipantAddresses()
      .call();

    let participants = {};
    participantAddresses.forEach(async (value, index, array) => {
      const participant = await CBDC_Dapps.methods
        .addressToParticipant(value)
        .call();
      participants[value] = participant["name"];
    });

    const block = await web3.eth.getBlock("latest");

    const userSellRequests_raw = await CBDC_Dapps.getPastEvents("NewRequest", {
      filter: { seller: accounts[0] },
      fromBlock: 0,
      toBlock: "latest",
    });

    const userSellRequests = userSellRequests_raw.map((content, index) => {
      return content.returnValues;
    });

    userSellRequests.sort((a, b) => (a.expired_date > b.expired_date ? 1 : -1));

    const userBuyRequests_raw = await CBDC_Dapps.getPastEvents("NewRequest", {
      filter: { buyer: accounts[0] },
      fromBlock: 0,
      toBlock: "latest",
    });

    const userBuyRequests = userBuyRequests_raw.map((content, index) => {
      return content.returnValues;
    });

    userBuyRequests.sort((a, b) => (a.expired_date > b.expired_date ? 1 : -1));

    this.setState({
      web3,
      accounts,
      CBDC_Dapps,
      DigitalRupee,
      userSellRequests,
      userBuyRequests,
      block,
      participants,
    });
  }

  renderSellRow() {
    return this.state.userSellRequests
      .filter(function (content) {
        return true;
      })
      .map((request, index) => {
        return (
          <SellRequestRow
            index={index}
            web3={this.state.web3}
            accounts={this.state.accounts}
            request={request}
            participants={this.state.participants}
          ></SellRequestRow>
        );
      });
  }

  renderSellTable() {
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>SBN Code</Table.HeaderCell>
            <Table.HeaderCell>Buyer Name</Table.HeaderCell>
            <Table.HeaderCell>Total Unit</Table.HeaderCell>
            <Table.HeaderCell>Initial Unit Price</Table.HeaderCell>
            <Table.HeaderCell>Requested Unit Price (% margin)</Table.HeaderCell>
            <Table.HeaderCell>Total Sell Price</Table.HeaderCell>
            <Table.HeaderCell>Expired At</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell width={2} textAlign="center">
              Action
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{this.renderSellRow()}</Table.Body>
      </Table>
    );
  }

  renderBuyRow() {
    return this.state.userBuyRequests
      .filter(function (content) {
        return true;
      })
      .map((request, index) => {
        return (
          <BuyRequestRow
            index={index}
            web3={this.state.web3}
            accounts={this.state.accounts}
            request={request}
            participants={this.state.participants}
            DigitalRupee={this.state.DigitalRupee}
          ></BuyRequestRow>
        );
      });
  }

  renderBuyTable() {
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>SBN Code</Table.HeaderCell>
            <Table.HeaderCell>Seller Name</Table.HeaderCell>
            <Table.HeaderCell>Total Unit</Table.HeaderCell>
            <Table.HeaderCell>Initial Unit Price</Table.HeaderCell>
            <Table.HeaderCell>Requested Unit Price (% margin)</Table.HeaderCell>
            <Table.HeaderCell>Total Buy Price</Table.HeaderCell>
            <Table.HeaderCell>Expired At</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell width={2} textAlign="center">
              Action
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{this.renderBuyRow()}</Table.Body>
      </Table>
    );
  }

  render() {
    const { accounts } = this.state;

    return (
      <>
        <Layout>
          <Header as="h2" textAlign="center">
            SBN TRADE REQUESTS
          </Header>

          <Segment>
            <Grid>
              <Grid.Row>
                <Grid.Column width={3}>
                  <Popup
                    trigger={
                      <Icon name="help" color="blue" size="large" circular />
                    }
                    position="bottom left"
                    wide="very"
                    hoverable
                  >
                    <Popup.Header> Sell Requests</Popup.Header>
                    <Popup.Content>
                      This table shows previous sell requests that you have
                      made. In this case, you sell your SBN in exchange for
                      Digital Rupee
                      <br></br>
                      There are 2 possible actions available:
                      <br></br> <br></br>
                      <b>Cancel</b>
                      <br></br>
                      <Button color="red" icon>
                        <Icon name="close" />
                      </Button>
                      <br></br>
                      <p>
                        Press this button to cancel the request. Once cancelled,
                        buyer can't accept your request.
                      </p>
                      <b>Approve</b>
                      <br></br>
                      <Button color="blue" icon>
                        <Icon name="check circle" />
                      </Button>
                      <p>
                        Press this button to approve your SBN to sell. This
                        button only appears if you did not approve your SBN
                        token right after contract creation. SBN token spending
                        must be approved before buyer can accept the request.
                      </p>
                    </Popup.Content>
                    <Divider />
                    <Popup.Header>Creating New Sell Request</Popup.Header>
                    <Popup.Content>
                      To create new sell request, press the plus button {""}
                      <Button color="blue" size="mini" icon>
                        <Icon name="plus" />
                      </Button>
                      {} on the right side
                    </Popup.Content>
                  </Popup>
                </Grid.Column>
                <Grid.Column width={10}>
                  <Header as="h2" textAlign="center">
                    Sell Requests
                  </Header>
                </Grid.Column>
                <Grid.Column width={3} textAlign="right">
                  <Popup
                    content="Create New Sell Request"
                    trigger={
                      <Button
                        icon="add"
                        primary
                        as={"a"}
                        href="/sbn/trade/new"
                      />
                    }
                    position="left center"
                  />
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>{this.renderSellTable()}</Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>

          <Segment>
            <Grid>
              <Grid.Row>
                <Grid.Column width={3}>
                  <Popup
                    trigger={
                      <Icon name="help" color="blue" size="large" circular />
                    }
                    position="bottom left"
                    wide="very"
                    hoverable
                  >
                    <Popup.Header> Buy Requests</Popup.Header>
                    <Popup.Content>
                      This table shows sell requests offered to you. In this
                      case, you buy their SBN using your Digital Rupee
                      <br></br>
                      There are 2 possible actions available:
                      <br></br> <br></br>
                      <b>Reject</b>
                      <br></br>
                      <Button color="red" icon>
                        <Icon name="close" />
                      </Button>
                      <br></br>
                      <p>
                        Press this button to cancel (reject) the contract. This
                        action only available if the request has not been
                        rejected or cancelled yet.
                      </p>
                      <b>Accept</b>
                      <br></br>
                      <Button color="green" icon>
                        <Icon name="check" />
                      </Button>
                      <p>
                        Press this button to accept the request. Once accepted,
                        you get the SBN in exchange for your Digital Rupee as
                        stated in the request.
                      </p>
                    </Popup.Content>
                  </Popup>
                </Grid.Column>
                <Grid.Column width={10}>
                  <Header as="h2" textAlign="center">
                    Buy Requests
                  </Header>
                </Grid.Column>
                <Grid.Column width={3} textAlign="right"></Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>{this.renderBuyTable()}</Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Layout>
      </>
    );
  }
}

export default Requests;
