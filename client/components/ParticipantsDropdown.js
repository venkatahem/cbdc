import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";

import getContract from "../lib/getContract";
import getWeb3Adresses from "../lib/getWeb3Address";
import CBDC_Dapps_build from "../../build/contracts/CBDC_Dapps.json";

import {
  ParticipantStatus,
  reverseParticipantStatus,
} from "../helper_function/ParticipantStatus";

class ParticipantsDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: undefined,
      CBDC_Dapps: undefined,
      participantAddresses: [],
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);
    if (CBDC_Dapps !== undefined) {
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

      const { includeSelf, includeInactive } = this.props;
      const participantOptions = participants
        .filter(function (content) {
          let active = content.status == reverseParticipantStatus.Active;
          if (!active) return false;
          if (includeSelf) return true;
          if (content.account != accounts[0]) return true;

          return false;
        })
        .map((content, index) => {
          return {
            key: content["account"],
            text:
              content["name"].toString() +
              " - " +
              content["account"].toString(),
            value: content,
          };
        });

      this.setState({ participantOptions });
    }
  }

  render() {
    return (
      <>
        <Dropdown
          search
          onChange={this.props.onChange}
          placeholder="Select Account"
          fluid
          selection
          options={this.state.participantOptions}
        />
      </>
    );
  }
}

export default ParticipantsDropdown;
