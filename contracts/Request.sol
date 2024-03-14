// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

enum RequestStatus {
    PendingBuyer,
    Cancelled,
    Rejected,
    Accepted
}

contract Request {
    IERC20 public digitalRupiah;
    address public buyer;
    uint256 public rupiahAmount;

    IERC20 public SBN;
    address public seller;
    uint256 public sbnAmount;

    RequestStatus public status;
    uint256 public Timestamp_expiredDate;

    constructor(
        address _digitalRupiah,
        address _buyer,
        uint256 _rupiahAmount,
        address _SBN,
        address _seller,
        uint256 _sbnAmount,
        uint256 _expiredDate
    ) {
        require(_buyer != _seller, "buyer and seller must be different");

        require(_expiredDate % 3600 == 0, "Expired date must at an exact hour");
        require(
            _expiredDate <= (block.timestamp + 1 days),
            "Expired date must not exceed 1 day from now"
        );

        digitalRupiah = IERC20(_digitalRupiah);
        buyer = _buyer;
        rupiahAmount = _rupiahAmount;

        SBN = IERC20(_SBN);
        seller = _seller;

        sbnAmount = _sbnAmount;

        require(
            SBN.balanceOf(seller) >= sbnAmount,
            "SBN units to sell not enough"
        );

        Timestamp_expiredDate = _expiredDate;

        status = RequestStatus.PendingBuyer;

        // seller must approve their SBN after contract creation
    }

    function accept() public {
        require(msg.sender == buyer, "Only Buyer Can Accept");
        require(status == RequestStatus.PendingBuyer, "Request was completed");
        require(block.timestamp <= Timestamp_expiredDate, "Request expired");
        require(
            digitalRupiah.allowance(buyer, address(this)) >= rupiahAmount,
            "Buyer's Digital Rupiah allowance is too low"
        );
        require(
            SBN.allowance(seller, address(this)) >= sbnAmount,
            "Seller's SBN allowance is too low"
        );

        _safeTransferFrom(digitalRupiah, buyer, seller, rupiahAmount);
        _safeTransferFrom(SBN, seller, buyer, sbnAmount);

        status = RequestStatus.Accepted;
    }

    function cancel() public {
        require(msg.sender == seller, "Only seller can cancel");
        require(status == RequestStatus.PendingBuyer, "Request was completed");

        status = RequestStatus.Cancelled;
    }

    function reject() public {
        require(msg.sender == buyer, "Only buyer can reject");
        require(status == RequestStatus.PendingBuyer, "Request was completed");

        status = RequestStatus.Rejected;
    }

    function _safeTransferFrom(
        IERC20 token,
        address sender,
        address recipient,
        uint256 amount
    ) private {
        bool sent = token.transferFrom(sender, recipient, amount);
        require(sent, "Token transfer failed");
    }
}
