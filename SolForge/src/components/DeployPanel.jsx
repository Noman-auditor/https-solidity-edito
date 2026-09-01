import { useMemo, useState } from "react";

import {
  connectWallet,
  deployContract,
  NETWORKS
} from "../deploy/deploy";


export default function DeployPanel({
  compiled
}) {

  const names =
    compiled
      ? Object.keys(compiled)
      : [];


  const [contractName, setContractName] =
    useState(names[0] || "");


  const [network, setNetwork] =
    useState("sepolia");


  const [constructorArgs, setConstructorArgs] =
    useState("");


  const [account, setAccount] =
    useState("");


  const [status, setStatus] =
    useState("Wallet not connected.");


  const [txHash, setTxHash] =
    useState("");


  const [contractAddress, setContractAddress] =
    useState("");


  const contract =
    compiled?.[contractName];


  const constructor =
    useMemo(() => {

      return contract?.abi?.find(
        item =>
          item.type === "constructor"
      );

    }, [contract]);


  async function handleConnect() {

    try {

      setStatus(
        "Connecting wallet..."
      );

      const address =
        await connectWallet();

      setAccount(address);

      setStatus(
        "Wallet connected."
      );

    } catch (error) {

      setStatus(
        error.message
      );

    }

  }


  function parseArguments() {

    if (!constructor?.inputs?.length) {
      return [];
    }


    if (!constructorArgs.trim()) {

      throw new Error(
        "Constructor arguments are required."
      );

    }


    let values;

    try {

      values =
        JSON.parse(
          constructorArgs
        );

    } catch {

      throw new Error(
        "Constructor arguments must be valid JSON."
      );

    }


    if (!Array.isArray(values)) {

      throw new Error(
        "Constructor arguments must be a JSON array."
      );

    }


    if (
      values.length !==
      constructor.inputs.length
    ) {

      throw new Error(
        `Expected ${constructor.inputs.length} constructor argument(s).`
      );

    }


    return values;
  }


  async function handleDeploy() {

    try {

      if (!contract) {

        throw new Error(
          "Compile a contract first."
        );

      }


      setTxHash("");
      setContractAddress("");


      const args =
        parseArguments();


      const result =
        await deployContract({

          abi:
            contract.abi,

          bytecode:
            contract.bytecode,

          args,

          network,

          onStatus:
            setStatus

        });


      setTxHash(
        result.hash
      );


      setContractAddress(
        result.contractAddress || ""
      );


      setStatus(
        "Deployment completed."
      );

    } catch (error) {

      setStatus(
        error?.shortMessage ||
        error?.message ||
        "Deployment failed."
      );

    }

  }


  return (

    <div className="deployPanel">

      <h2>
        Deploy Contract
      </h2>

      <p className="deployDescription">
        Deploy your compiled Solidity contract
        directly through your connected wallet.
      </p>


      {!account ? (

        <button
          className="deployBtn"
          onClick={handleConnect}
        >
          🦊 Connect Wallet
        </button>

      ) : (

        <div className="connectedWallet">

          <span>
            Connected
          </span>

          <code>
            {account.slice(0, 6)}
            ...
            {account.slice(-4)}
          </code>

        </div>

      )}


      <label>
        Contract
      </label>

      <select
        value={contractName}
        onChange={e =>
          setContractName(
            e.target.value
          )
        }
      >

        {names.map(name => (

          <option
            key={name}
            value={name}
          >
            {name}
          </option>

        ))}

      </select>


      <label>
        Network
      </label>

      <select
        value={network}
        onChange={e =>
          setNetwork(
            e.target.value
          )
        }
      >

        {Object.entries(
          NETWORKS
        ).map(
          ([key, item]) => (

            <option
              key={key}
              value={key}
            >
              {item.name}
            </option>

          )
        )}

      </select>


      {constructor && (

        <>

          <div className="constructorTitle">
            Constructor Parameters
          </div>


          {constructor.inputs.map(
            (input, index) => (

              <div
                className="parameter"
                key={index}
              >

                <div>

                  <strong>
                    {input.name ||
                      `arg${index}`}
                  </strong>

                  <small>
                    {input.type}
                  </small>

                </div>

              </div>

            )
          )}


          <textarea

            value={constructorArgs}

            onChange={e =>
              setConstructorArgs(
                e.target.value
              )
            }

            placeholder={
`[
  "Hello Web3"
]`
            }

          />

          <small className="hint">
            Enter constructor values as a
            JSON array.
          </small>

        </>

      )}


      <button

        className="deployBtn"

        disabled={
          !account ||
          !contract
        }

        onClick={handleDeploy}

      >
        🚀 Deploy Contract
      </button>


      <div className="deployStatus">

        <strong>
          Status
        </strong>

        <p>
          {status}
        </p>

      </div>


      {txHash && (

        <div className="resultBox">

          <span>
            Transaction
          </span>

          <code>
            {txHash}
          </code>

        </div>

      )}


      {contractAddress && (

        <div className="resultBox">

          <span>
            Contract Address
          </span>

          <code>
            {contractAddress}
          </code>

        </div>

      )}

    </div>

  );

}
