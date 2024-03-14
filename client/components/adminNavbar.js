import React, { Component } from "react";

import { Menu, Popup, Container, Dropdown } from "semantic-ui-react";

import NextJSImage from "next/image";

import "semantic-ui-css/semantic.min.css";
import myImage from "../src/logo/CBDC_white.svg";

class AdminNavbar extends Component {
  constructor(props) {
    super(props);

    // this.state = { activeItem: "home" };
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    return (
      <div>
        <Menu size="medium" color={"blue"} inverted stackable borderless>
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
            <Dropdown item text="Participants" simple>
              <Dropdown.Menu>
                <Dropdown.Item as={"a"} href="/admin/participants">
                  Manage Participants
                </Dropdown.Item>
                <Dropdown.Item as={"a"} href="/admin/participants/new">
                  Add New Participant
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>

          <Menu.Item>
            <Dropdown item text="Digital Rupiah" simple>
              <Dropdown.Menu>
                <Dropdown.Item as={"a"} href="/admin/digitalrupiah">
                  Issuance
                </Dropdown.Item>

                <Dropdown.Item as={"a"} href="/admin/digitalrupiah/redemption">
                  Redemption History
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>

          <Menu.Item>
            <Dropdown item text="SBN" simple>
              <Dropdown.Menu>
                <Dropdown.Item as={"a"} href="/admin/sbn">
                  Issuance
                </Dropdown.Item>
                <Dropdown.Item as={"a"} href="/admin/sbn/redemption">
                  Redemption History
                </Dropdown.Item>
                <Dropdown.Item as={"a"} href="/admin/sbn/new">
                  Add New SBN
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
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

export default AdminNavbar;
