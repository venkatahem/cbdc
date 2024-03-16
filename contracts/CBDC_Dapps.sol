// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "./Participant_Struct.sol";
import "./DigitalRupee.sol";
import "./Request.sol";
import "./SBN.sol";

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract CBDC_Dapps {
    address public immutable BankIndonesiaAddress;

    modifier isBankIndonesia() {
        require(msg.sender == BankIndonesiaAddress, "Not Central Bank");
        _;
    }

    constructor() {
        BankIndonesiaAddress = msg.sender;

        addParticipant(msg.sender, "Central Bank");
    }

    // create DigitalRupee

    DigitalRupee public digitalRupee;

    function createDigitalRupee() public isBankIndonesia {
        digitalRupee = new DigitalRupee(BankIndonesiaAddress, address(this));
    }

    // modifying participant

    address[] public participantAddresses;

    mapping(address => Participant) public addressToParticipant;

    function addParticipant(
        address _address,
        string memory _name
    ) public isBankIndonesia {
        require(
            addressToParticipant[_address].status == ParticipantStatus.NotExist,
            "participant already exist, use edit instead"
        );

        Participant memory _participant = Participant({
            account: _address,
            status: ParticipantStatus.Active,
            name: _name
        });
        participantAddresses.push(_address);
        addressToParticipant[_address] = _participant;
    }

    function editParticipant(
        address _address,
        string memory _name,
        ParticipantStatus _status
    ) public isBankIndonesia {
        require(
            _status != ParticipantStatus.NotExist,
            "to delete participant, use remove participant"
        );
        addressToParticipant[_address].status = _status;
        addressToParticipant[_address].name = _name;
    }

    //disclaimer: this function must be rarely called, e.g. when a company (participant) went bankrupt. Otherwise use edit participant
    function removeParticipant(uint256 _index) public isBankIndonesia {
        require(_index < participantAddresses.length, "index out of bound");

        address _address = participantAddresses[_index];
        delete addressToParticipant[_address];

        for (uint256 i = _index; i < participantAddresses.length - 1; i++) {
            participantAddresses[i] = participantAddresses[i + 1];
        }
        participantAddresses.pop();
    }

    function getParticipant(
        address _address
    ) external view returns (Participant memory) {
        return addressToParticipant[_address];
    }

    function getAllParticipantAddresses()
        public
        view
        returns (address[] memory)
    {
        return participantAddresses;
    }

    //

    modifier callerIsActiveParticipant() {
        require(
            addressToParticipant[msg.sender].status == ParticipantStatus.Active,
            "caller is not an active participant"
        );
        _;
    }

    // SBN Factory
    SBN[] public sbnAddresses;

    function createSBN(
        string memory _name,
        string memory _symbol,
        uint256 _initialUnitPrice,
        uint256 _releasedDate,
        uint256 _maturityDate
    ) public isBankIndonesia {
        SBN _sbn = new SBN({
            _minter: BankIndonesiaAddress,
            _name: _name,
            _symbol: _symbol,
            _initialUnitPrice: _initialUnitPrice,
            _releasedDate: _releasedDate,
            _maturityDate: _maturityDate,
            _cbdc: address(this)
        });

        sbnAddresses.push(_sbn);
    }

    function getSbnAddresses() public view returns (SBN[] memory) {
        return sbnAddresses;
    }

    event NewRequest(
        address indexed buyer,
        address indexed seller,
        address indexed SBN,
        uint256 sbnAmount,
        uint256 rupeeAmount,
        uint256 expired_date,
        Request requestAddress
    );

    function createSellRequest(
        address _SBN,
        address _buyer,
        uint256 _sbnAmount,
        uint256 _rupeeAmount,
        uint256 _expiredDate
    ) public callerIsActiveParticipant {
        require(
            addressToParticipant[_buyer].status == ParticipantStatus.Active,
            "buyer is not an active participant"
        );

        address _digitalRupee = address(digitalRupee);
        address _seller = msg.sender;

        Request _request = new Request({
            _digitalRupee: _digitalRupee,
            _buyer: _buyer,
            _rupeeAmount: _rupeeAmount,
            _SBN: _SBN,
            _seller: _seller,
            _sbnAmount: _sbnAmount,
            _expiredDate: _expiredDate
        });

        emit NewRequest(
            _buyer,
            _seller,
            _SBN,
            _sbnAmount,
            _rupeeAmount,
            _expiredDate,
            _request
        );

        // make sure to guide seller to approve their SBN on the dapps, because it is not possible to approve using this contract
    }
}
