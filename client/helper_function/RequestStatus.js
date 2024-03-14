const RequestStatus = {
  PendingBuyer: 0,
  Cancelled: 1,
  Rejected: 2,
  Accepted: 3,
};

const ReadableStatus = {
  PendingBuyer: 0,
  Cancelled: 1,
  Rejected: 2,
  Accepted: 3,
  PendingSellerApproval: 4,
  PendingBuyerApproval: 5,
  Expired: 6,
};

const reverseReadableStatus = {
  0: "Pending Buyer's Response",
  1: "Cancelled",
  2: "Rejected",
  3: "Accepted",
  4: "Pending Seller's SBN Approval",
  5: "Pending Buyer's DIDR Approval",
  6: "Expired",
};

export { RequestStatus, ReadableStatus, reverseReadableStatus };
