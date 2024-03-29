// SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

enum ParticipantStatus {
    NotExist,
    Active,
    NotActive
}

struct Participant {
    address account;
    string name;
    ParticipantStatus status;
}
