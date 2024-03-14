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
            <Message.Header>Restricted</Message.Header>
            <p>You do not have access to this page</p>
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
