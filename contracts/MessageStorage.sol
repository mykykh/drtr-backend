// SPDX-License-Identifier: GPLv3
pragma solidity ^0.8.18;

error MessageStorage__MessageWithIdNotFound(uint256 requestedId, uint256 maxMessageId);

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

    function postMessage(string calldata messageText) external {
        messages.push(Message({author: msg.sender,
                              text: messageText,
                              currentBalance: 0,
                              totalDonations: 0}));

        emit MessagePosted(currentId, msg.sender, messageText);

        currentId += 1;
    }

    function getMessage(uint256 messageId) external view returns(Message memory) {
        if (messageId >= currentId)
            revert MessageStorage__MessageWithIdNotFound(messageId, currentId);

        return messages[messageId];
    }
}
