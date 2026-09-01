import solc from "solc";

/**
 * Compile a Solidity source.
 *
 * Returns:
 * - ABI
 * - creation bytecode
 * - runtime bytecode
 * - compiler errors/warnings
 */
export function compileSolidity(
  source,
  fileName = "Contract.sol"
) {

  const input = {

    language: "Solidity",

    sources: {

      [fileName]: {
        content: source
      }

    },

    settings: {

      optimizer: {
        enabled: true,
        runs: 200
      },

      outputSelection: {

        "*": {

          "*": [
            "abi",
            "evm.bytecode",
            "evm.deployedBytecode",
            "metadata"
          ]

        }

      }

    }

  };


  const output =
    JSON.parse(
      solc.compile(
        JSON.stringify(input)
      )
    );


  const errors =
    output.errors || [];


  const fatalErrors =
    errors.filter(
      item =>
        item.severity === "error"
    );


  if (fatalErrors.length) {

    return {

      success: false,

      errors,

      contracts: {}

    };

  }


  const contracts = {};


  for (
    const sourceName
    of Object.keys(
      output.contracts || {}
    )
  ) {

    for (
      const contractName
      of Object.keys(
        output.contracts[sourceName]
      )
    ) {

      const contract =
        output.contracts[
          sourceName
        ][contractName];


      contracts[
        contractName
      ] = {

        abi: contract.abi,

        bytecode:
          contract.evm
            .bytecode
            .object,

        deployedBytecode:
          contract.evm
            .deployedBytecode
            .object,

        metadata:
          contract.metadata

      };

    }

  }


  return {

    success: true,

    errors,

    contracts

  };

}
