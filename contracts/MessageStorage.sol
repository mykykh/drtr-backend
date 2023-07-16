// SPDX-License-Identifier: GPLv3
pragma solidity ^0.8.18;

error MessageStorage__MessageWithIdNotFound(uint256 requestedId, uint256 maxMessageId);
error MessageStorage__OnlyAuthorCanCallThisFunction(address caller, address author);
error MessageStorage__WithdrawFromMessageHasFailed(uint256 messageId);

contract MessageStorage {
    struct Message {
        address author;
        string text;
        uint256 currentBalance;
        uint256 totalDonations;
    }

    uint256 public currentId = 0;
    Message[] public messages;

    event MessagePosted(
        uint256 indexed messageId,
        address indexed atuthor,
        string text
    );

    event MessageDonation(
        uint256 indexed messageId,
        address indexed donator,
        uint256 amount
    );

    event MessageWithdraw(
        uint256 indexed messageId,
        address indexed author,
        uint256 amount
    );

    modifier messageExists(uint256 messageId) {
        if (messageId >= currentId)
            revert MessageStorage__MessageWithIdNotFound(messageId, currentId);

        _;
    }

    modifier onlyAuthor(uint256 messageId) {
        if (messages[messageId].author != msg.sender)
            revert MessageStorage__OnlyAuthorCanCallThisFunction(msg.sender,
                                                                 messages[messageId].author);

        _;
    }

    function postMessage(string calldata messageText) external {
        messages.push(Message({author: msg.sender,
                              text: messageText,
                              currentBalance: 0,
                              totalDonations: 0}));

        emit MessagePosted(currentId, msg.sender, messageText);

        currentId += 1;
    }

    function getMessage(uint256 messageId) external view messageExists(messageId)
    returns(Message memory) {
        return messages[messageId];
    }

    function donateToMessage(uint256 messageId) external payable messageExists(messageId) {
        messages[messageId].currentBalance += msg.value;
        messages[messageId].totalDonations += msg.value;

        emit MessageDonation(messageId, msg.sender, msg.value);
    }

    function withdrawFromMessage(uint256 messageId) external messageExists(messageId)
    onlyAuthor(messageId) {
        Message memory message = messages[messageId];

        (bool isSuccessful, bytes memory data) = payable(message.author).call{
            value: message.currentBalance
        }("");

        if (!isSuccessful)
            revert MessageStorage__WithdrawFromMessageHasFailed(messageId);

        emit MessageWithdraw(messageId, message.author, message.currentBalance);

        messages[messageId].currentBalance = 0;
    }
}
