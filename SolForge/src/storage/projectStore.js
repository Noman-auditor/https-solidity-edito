const STORAGE_KEY =
  "solforge_project_v1";


const defaultProject = {

  name: "My Solidity Project",

  files: {

    "contracts/Contract.sol": {
      type: "file",
      content: `// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract HelloWorld {

    string public message;

    constructor() {
        message = "Hello, Web3!";
    }

    function setMessage(
        string calldata newMessage
    ) external {
        message = newMessage;
    }
}`
    }

  },

  activeFile:
    "contracts/Contract.sol"

};


export function loadProject(){

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if(!saved){

      return defaultProject;
    }

    return JSON.parse(saved);

  }catch{

    return defaultProject;
  }

}


export function saveProject(
  project
){

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(project)
  );

}


export function resetProject(){

  localStorage.removeItem(
    STORAGE_KEY
  );

  return defaultProject;
}
