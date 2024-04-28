import React, { Component } from "react";
import {
  Card,
  Header,
  Divider,
  Container,
  Image,
  Icon,
} from "semantic-ui-react";

import Layout from "../components/layout";

class About extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {}

  render() {
    return (
      <Layout>
        <Header as="h1" textAlign="center">
          ABOUT US
        </Header>
        <Divider></Divider>
        <Container text>
          <Header as="h2" textAlign="center">
            Developer
          </Header>
          <Card.Group centered>
            <Card>
              <Image
                src="https://react.semantic-ui.com/images/avatar/large/matthew.png"
                wrapped
                ui={false}
              />
              <Card.Content>
                <Card.Header>Derryl Taufik</Card.Header>
                <Card.Meta>
                  <span className="date">Blockchain Apps Developer</span>
                </Card.Meta>
                <Card.Description>
                  Derryl develops the web apps.
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <a href="https://www.linkedin.com/in/derryl-taufik/">
                  <Icon name="linkedin" />
                  LinkedIn
                </a>
              </Card.Content>
            </Card>
            <Card>
              <Image
                src="https://react.semantic-ui.com/images/avatar/large/elliot.jpg"
                wrapped
                ui={false}
              />
              <Card.Content>
                <Card.Header>Marchel Budi Kusuma</Card.Header>
                <Card.Meta>
                  <span className="date">Blockchain Core Developer</span>
                </Card.Meta>
                <Card.Description>
                  Marchel develops the blockchain.
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <a href="https://www.linkedin.com/in/marchel-budi-kusuma-540792204">
                  <Icon name="linkedin" />
                  LinkedIn
                </a>
              </Card.Content>
            </Card>
          </Card.Group>
        </Container>
      </Layout>
    );
  }
}

export default About;
