import React, { Component } from "react";

import { Menu, Popup, Container } from "semantic-ui-react";

class Footer extends Component {
  constructor(props) {
    super(props);

    // this.state = { activeItem: "home" };
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    return (
      <Menu size="large" color={"teal"} inverted borderless stackable>
        <Menu.Item>
          <Container textAlign="left">Central Bank I CBDC&copy;</Container>
        </Menu.Item>

        <Menu.Menu position="right">
          <Menu.Item as={"a"} href="/help">
            Help
          </Menu.Item>
          {/* <Menu.Item as={"a"} href="/about">
            About Us
          </Menu.Item> */}
        </Menu.Menu>
      </Menu>
    );
  }
}

export default Footer;
