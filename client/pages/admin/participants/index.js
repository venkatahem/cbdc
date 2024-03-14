import React, { Component } from "react";
import { Header, Table, Icon } from "semantic-ui-react";
import ParticipantsTable from "../../../components/ParticipantsTable";

import getContract from "../../../lib/getContract";
import getWeb3Adresses from "../../../lib/getWeb3Address";
import CBDC_Dapps_build from "../../../../build/contracts/CBDC_Dapps.json";
import web3_utils from "web3-utils";

import Layout from "../../../components/layout";

class AdminParticipants extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: undefined,
      CBDC_Dapps: undefined,
      participants: [],
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

  render() {
    const { accounts, web3, CBDC_Dapps } = this.state;

    return (
      <>
        <Layout>
          <Header as="h2" textAlign="center">
            Manage Participants
          </Header>

          <ParticipantsTable
            accounts={accounts}
            web3={web3}
            CBDC_Dapps={CBDC_Dapps}
          ></ParticipantsTable>
        </Layout>
      </>
    );
  }
}

export default AdminParticipants;
