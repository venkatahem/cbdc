import React, { Component } from "react";
import { List, Header, Divider, Container } from "semantic-ui-react";

import Layout from "../components/layout";

class Help extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {}

  render() {
    return (
      <Layout>
        <Header as="h1" textAlign="center">
          HELP
        </Header>
        <Divider></Divider>
        <Container text>
          <Header as="h2">Connect to Metamask</Header>
          <p>
            This application requires a Web3 wallet browser extension to
            operate. If you don’t have a Web3 wallet extension, we recommend
            using Metamask that can be downloaded{" "}
            <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en">
              here
            </a>
          </p>
          <p>
            To import your account to Metamask, you can find the tutorial{" "}
            <a href="https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-Account">
              here
            </a>
          </p>
          <p>
            If you have Metamask extension Installed in your browser, make sure
            that you have the Metamask unlocked and allow your account to
            connect to the website. The page will automatically try to connect
            to your Metamask account.
          </p>
        </Container>
        <br></br>
        <Container text>
          <Header as="h2">Transfer Digital Rupee</Header>
          This feature allows you to transfer digital rupee to other active
          participant. To use this feature, do as follows:
          <List ordered>
            <List.Item>
              Open Transfer Digital Rupee page in Digital Rupee - Transfer.
            </List.Item>
            <List.Item>Select a Receiver.</List.Item>
            <List.Item>
              Input the amount to transfer. Amount must me greater than 0 and
              less than your current Digital Rupee balance.
            </List.Item>
            <List.Item>
              Click Submit, and a confirmation pop up should be shown
            </List.Item>
            <List.Item>
              Check the details, if everything is correct, click Continue and a
              Metamask pop up will be shown.
            </List.Item>
            <List.Item>
              Sign the transaction by clicking on Confirm in the Metamask pop
              up.
            </List.Item>
            <List.Item>Wait until the process is completed.</List.Item>
          </List>
        </Container>

        <br></br>
        <Container text>
          <Header as="h2">Transfer SBN</Header>
          This feature allows you to transfer SBN to other active participant.
          To use this feature, do as follows:
          <List ordered>
            <List.Item> Open Transfer SBN Page in SBN - Transfer.</List.Item>
            <List.Item>Select the SBN that you will transfer</List.Item>
            <List.Item>Select a Receiver.</List.Item>
            <List.Item>
              Input the amount to transfer. Amount must me greater than 0 and
              less than your current selected SBN ownership.
            </List.Item>
            <List.Item>
              Click Submit, and a confirmation pop up should be shown
            </List.Item>
            <List.Item>
              Check the details, if everything is correct, click Continue and a
              Metamask pop up will be shown.
            </List.Item>
            <List.Item>
              Sign the transaction by clicking on Confirm in the Metamask pop
              up.
            </List.Item>
            <List.Item>Wait until the transaction is completed.</List.Item>
            <List.Item>
              You can view your transaction History in Digital Rupee-Account
              Activities
            </List.Item>
          </List>
        </Container>

        <br></br>
        <Container text>
          <Header as="h2">Transfer Digital Rupee</Header>
          This feature allows you to transfer digital rupee to other active
          participant. To use this feature, do as follows:
          <List ordered>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
          </List>
        </Container>

        <br></br>
        <Container text>
          <Header as="h2">Transfer Digital Rupee</Header>
          This feature allows you to transfer digital rupee to other active
          participant. To use this feature, do as follows:
          <List ordered>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
            <List.Item></List.Item>
          </List>
        </Container>
      </Layout>
    );
  }
}

export default Help;
