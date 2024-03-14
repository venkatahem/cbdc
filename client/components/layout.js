import React, { Component } from "react";

import { Container, Header } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

import Navbar from "./navbar";
import AdminNavbar from "./adminNavbar";
import Footer from "./footer";

import Router from "next/router";

import getWeb3Adresses from "../lib/getWeb3Address";
import getContract from "../lib/getContract";
import CBDC_Dapps_build from "../../build/contracts/CBDC_Dapps.json";

class Layout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: undefined,
      accounts: undefined,
      admin: false,
      restricted: true,
    };
  }

  async componentDidMount() {
    const { web3, accounts } = await getWeb3Adresses();

    try {
      const CBDC_Dapps = await getContract(web3, CBDC_Dapps_build);

      const bi_address = await CBDC_Dapps.methods.BankIndonesiaAddress().call();
      const participant = await CBDC_Dapps.methods
        .addressToParticipant(accounts[0])
        .call();

      const pathArr = Router.pathname.split("/");
      const admin = accounts[0] == bi_address && pathArr[1] === "admin";
      const restricted = accounts[0] != bi_address && pathArr[1] === "admin";

      if (restricted) Router.replace("/restricted");

      this.setState({ web3, accounts, participant, admin, restricted });
    } catch (e) {
      console.log(e);
    }

    window.ethereum.on("accountsChanged", (accounts) => {
      console.log(accounts);
      window.location.reload(false);
    });

    window.ethereum.on("chainChanged", (networkId) => {
      console.log("networkChanged", networkId);
      try {
        window.location.reload();
      } catch (e) {
        console.log("Error", e);
      }
    });
  }

  render() {
    const { web3, accounts, participant, admin, restricted } = this.state;

    return (
      <>
        {admin && !restricted ? (
          <AdminNavbar
            web3={web3}
            accounts={accounts}
            participant={participant}
          ></AdminNavbar>
        ) : (
          <Navbar
            web3={web3}
            accounts={accounts}
            participant={participant}
          ></Navbar>
        )}
        <br></br>
        <Container style={{ minHeight: 610 }}>{this.props.children}</Container>
        <br></br> <br></br>
        <Footer></Footer>
      </>
    );
  }
}

export default Layout;
