// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract HelloWorld {

    string public message;

    event MessageChanged(
        address indexed user,
        string message
    );

    constructor(
        string memory initialMessage
    ) {
        message = initialMessage;
    }

    function setMessage(
        string calldata newMessage
    ) external {

        message = newMessage;

        emit MessageChanged(
            msg.sender,
            newMessage
        );
    }

    function getMessage()
        external
        view
        returns (string memory)
    {
        return message;
    }
}
