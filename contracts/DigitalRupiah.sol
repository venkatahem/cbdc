// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./CBDC_Dapps.sol";
import "./Participant_Struct.sol";

contract DigitalRupiah is ERC20 {
    address private minter;
    CBDC_Dapps private cbdc;

    event Issuance(address indexed receiver, uint256 value);
    event Redemption(address indexed sender, uint256 value);

    constructor(
        address _minter,
        address _cbdc
    ) ERC20("Digital Rupiah", "DIDR") {
        minter = _minter;
        cbdc = CBDC_Dapps(_cbdc);
    }

    modifier isMinter() {
        require(
            _msgSender() == minter,
            "Error, msg.sender does not have minter role"
        );
        _;
    }

    function mint(address _toAddress, uint256 _amount) external isMinter {
        _mint(_toAddress, _amount);
        emit Issuance(_toAddress, _amount);
    }

    function burn(uint256 _amount) external isMinter {
        _burn(_msgSender(), _amount);
    }

    function redeem(uint256 _amount) external {
        require(
            _isActiveParticipant(_msgSender()),
            "sender is not an active CBDC participant"
        );
        _burn(_msgSender(), _amount);
        emit Redemption(_msgSender(), _amount);
    }

    function _getParticipant(
        address _address
    ) private view returns (Participant memory) {
        Participant memory _participant = cbdc.getParticipant(_address);
        return _participant;
    }

    function _isActiveParticipant(
        address _address
    ) private view returns (bool) {
        Participant memory _participant = cbdc.getParticipant(_address);

        return _participant.status == ParticipantStatus.Active;
    }

    function transfer(
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        require(
            _isActiveParticipant(_msgSender()),
            "sender is not an active CBDC participant"
        );
        require(
            _isActiveParticipant(recipient),
            "receiver is not an active CBDC participant"
        );

        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function approve(
        address spender,
        uint256 amount
    ) public override returns (bool) {
        require(
            _isActiveParticipant(_msgSender()),
            "sender is not an active CBDC participant"
        );

        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        uint256 currentAllowance = allowance(sender, _msgSender());
        if (currentAllowance != type(uint256).max) {
            require(
                currentAllowance >= amount,
                "ERC20: transfer amount exceeds allowance"
            );
            unchecked {
                _approve(sender, _msgSender(), currentAllowance - amount);
            }
        }

        require(
            _isActiveParticipant(sender),
            "sender is not an active CBDC participant"
        );
        require(
            _isActiveParticipant(recipient),
            "receiver is not an active CBDC participant"
        );

        _transfer(sender, recipient, amount);

        return true;
    }
}
