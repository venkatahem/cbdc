import React, { Component } from "react";

import { Menu, Popup, Container, Dropdown } from "semantic-ui-react";

import NextJSImage from "next/image";

import "semantic-ui-css/semantic.min.css";
import myImage from "../src/logo/CBDC_white.svg";

import Router from "next/router";
import Link from "next/link";

class Navbar extends Component {
  constructor(props) {
    super(props);

    // this.state = { activeItem: "home" };
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    return (
      <div>
        <Menu size="medium" color={"teal"} inverted stackable borderless>
          <Menu.Item name="home">
            <a href="/">
              <NextJSImage
                src={myImage}
                layout="intrinsic"
                width={80}
                height={40}
              />
            </a>
          </Menu.Item>

          <Menu.Item>
            <Dropdown item text="Digital Rupee" simple>
              <Dropdown.Menu>
                <Dropdown.Item as={"a"} href="/digitalrupee">
                  Account Activites
                </Dropdown.Item>
                <Dropdown.Item as={"a"} href="/digitalrupee/transfer">
                  Transfer
                </Dropdown.Item>
                <Dropdown.Item as={"a"} href="/digitalrupee/redeem">
                  Redeem
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>

          <Menu.Item>
            <Dropdown item text="SBN" simple>
              <Dropdown.Menu>
                <Dropdown.Item as={"a"} href="/sbn">
                  Account Activites
                </Dropdown.Item>
                <Dropdown.Item as={"a"} href="/sbn/transfer">
                  Transfer
                </Dropdown.Item>

                <Dropdown.Item as={"a"} href="/sbn/redeem">
                  Redeem
                </Dropdown.Item>

                <Dropdown.Item as={"a"} href="/sbn/trade">
                  Trade
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>

          <Menu.Item as={"a"} href="/sbn/trade/new">
            Create New Sell Request
          </Menu.Item>

          <Menu.Menu position="right">
            <Menu.Item>
              <Container text fluid textAlign="right">
                <Popup
                  content={
                    this.props.participant
                      ? "Address: " + this.props.accounts[0]
                      : null
                  }
                  trigger={
                    <p>
                      Account:
                      {this.props.participant &&
                      this.props.participant.name.length > 0
                        ? " " + this.props.participant.name
                        : " account is not registered as participant"}
                    </p>
                  }
                />
              </Container>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </div>
    );
  }
}

export default Navbar;
