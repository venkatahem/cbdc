import React, { Component } from "react";

import { Container, Message, Button, Icon } from "semantic-ui-react";

class Restricted extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {}

  render() {
    return (
      <>
        <br></br>
        <br></br>
        <Container>
          <Message size="huge" error>
            <Message.Header>
              The Smart Contract is not deployed on this network
            </Message.Header>
            <p>please change the network and go back to home page</p>
            <Button color="blue" icon labelPosition="left" as={"a"} href="/">
              <Icon name="home" />
              Back to home page
            </Button>
          </Message>
        </Container>
      </>
    );
  }
}

export default Restricted;
