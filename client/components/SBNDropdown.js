import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";

import getContract from "../lib/getContract";
import getWeb3Adresses from "../lib/getWeb3Address";
import CBDC_Dapps_build from "../../build/contracts/CBDC_Dapps.json";
import SBN_build from "../../build/contracts/SBN.json";

class SBNDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: undefined,
      accounts: undefined,
      CBDC_Dapps: undefined,
      sbnOptions: [],
      selected_SBN: undefined,
      selected_SBN_detail: {},
      expired_datetime: new Date(),
      expired_datetime_unix: 0,
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);
    if (CBDC_Dapps !== undefined) {
      const sbnAddresses = await CBDC_Dapps.methods.getSbnAddresses().call();

      const sbns = await Promise.all(
        Array(sbnAddresses.length)
          .fill()
          .map((content, index) => {
            return getContract(web3, SBN_build, sbnAddresses[index]);
          })
      );

      const sbnOptions = await Promise.all(
        Array(sbnAddresses.length)
          .fill()
          .map(async (content, index) => {
            const symbol = await sbns[index].methods.symbol().call();
            const name = await sbns[index].methods.name().call();
            return {
              key: sbnAddresses[index],
              text: symbol + " - " + name,
              value: sbns[index],
            };
          })
      );

      this.setState({
        web3,
        accounts,
        CBDC_Dapps,
        sbnOptions,
      });
    }
  }

  render() {
    return (
      <>
        <Dropdown
          search
          onChange={this.props.onChange}
          placeholder="Select SBN"
          fluid
          selection
          options={this.state.sbnOptions}
        />
      </>
    );
  }
}

export default SBNDropdown;
