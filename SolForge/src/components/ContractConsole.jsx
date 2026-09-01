import { useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http
} from "viem";

import { NETWORKS } from "../deploy/deploy";

export default function ContractConsole() {

  const [address, setAddress] =
    useState("");

  const [network, setNetwork] =
    useState("sepolia");

  const [abiText, setAbiText] =
    useState("");

  const [abi, setAbi] =
    useState([]);

  const [result, setResult] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  function loadAbi() {

    try {

      const parsed =
        JSON.parse(abiText);

      if (!Array.isArray(parsed)) {
        throw new Error(
          "ABI must be a JSON array."
        );
      }

      setAbi(parsed);

      setResult(
        `Loaded ${parsed.length} ABI entries.`
      );

    } catch (error) {

      setResult(
        error.message
      );

    }

  }


  async function readFunction(
    item,
    args
  ) {

    try {

      setLoading(true);

      const selected =
        NETWORKS[network];


      const client =
        createPublicClient({

          chain:
            selected.chain,

          transport:
            http(selected.rpc)

        });


      const values =
        args.map(
          parseValue
        );


      const data =
        await client.readContract({

          address,

          abi,

          functionName:
            item.name,

          args:
            values

        });


      setResult(
        JSON.stringify(
          data,
          (_, value) =>
            typeof value === "bigint"
              ? value.toString()
              : value,
          2
        )
      );

    } catch (error) {

      setResult(
        error?.shortMessage ||
        error?.message ||
        "Read failed."
      );

    } finally {

      setLoading(false);

    }

  }


  async function writeFunction(
    item,
    args
  ) {

    try {

      if (
        !window.ethereum
      ) {

        throw new Error(
          "Compatible wallet not detected."
        );

      }


      setLoading(true);

      const selected =
        NETWORKS[network];


      const wallet =
        createWalletClient({

          chain:
            selected.chain,

          transport:
            custom(
              window.ethereum
            )

        });


      const [account] =
        await wallet.getAddresses();


      if (!account) {

        throw new Error(
          "Connect your wallet first."
        );

      }


      const values =
        args.map(
          parseValue
        );


      const hash =
        await wallet.writeContract({

          account,

          address,

          abi,

          functionName:
            item.name,

          args:
            values

        });


      setResult(
        `Transaction submitted:\n${hash}`
      );

    } catch (error) {

      setResult(
        error?.shortMessage ||
        error?.message ||
        "Transaction failed."
      );

    } finally {

      setLoading(false);

    }

  }


  const functions =
    abi.filter(
      item =>
        item.type === "function"
    );


  return (

    <div className="contractConsole">

      <h2>
        Contract Console
      </h2>


      <label>
        Contract Address
      </label>

      <input
        value={address}
        onChange={e =>
          setAddress(e.target.value)
        }
        placeholder="0x..."
      />


      <label>
        Network
      </label>

      <select
        value={network}
        onChange={e =>
          setNetwork(e.target.value)
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


      <label>
        ABI JSON
      </label>

      <textarea
        value={abiText}
        onChange={e =>
          setAbiText(e.target.value)
        }
        placeholder='Paste ABI JSON here...'
      />


      <button
        className="fullBtn"
        onClick={loadAbi}
      >
        Load ABI
      </button>


      {functions.map(
        (item, index) => (

          <FunctionCard
            key={`${item.name}-${index}`}
            item={item}
            onRead={readFunction}
            onWrite={writeFunction}
            loading={loading}
          />

        )
      )}


      <div className="consoleOutput">

        <div>
          Output
        </div>

        <pre>
          {result || "No result yet."}
        </pre>

      </div>

    </div>

  );
}


function FunctionCard({
  item,
  onRead,
  onWrite,
  loading
}) {

  const [values, setValues] =
    useState(
      () =>
        item.inputs?.map(
          () => ""
        ) || []
    );


  function updateValue(
    index,
    value
  ) {

    const next = [
      ...values
    ];

    next[index] = value;

    setValues(next);

  }


  return (

    <div className="functionCard">

      <div className="functionHeader">

        <strong>
          {item.name}
        </strong>

        <span>
          {item.stateMutability}
        </span>

      </div>


      {item.inputs?.map(
        (input, index) => (

          <div
            className="functionInput"
            key={index}
          >

            <label>
              {input.name ||
                `arg${index}`}
              {" "}
              <small>
                ({input.type})
              </small>
            </label>

            <input
              value={
                values[index] || ""
              }
              onChange={e =>
                updateValue(
                  index,
                  e.target.value
                )
              }
            />

          </div>

        )
      )}


      <div className="functionActions">

        {item.stateMutability ===
          "view" ||
        item.stateMutability ===
          "pure" ? (

          <button
            onClick={() =>
              onRead(
                item,
                values
              )
            }
            disabled={loading}
          >
            Read
          </button>

        ) : (

          <button
            className="writeAction"
            onClick={() =>
              onWrite(
                item,
                values
              )
            }
            disabled={loading}
          >
            Write
          </button>

        )}

      </div>

    </div>

  );
}


function parseValue(
  value
) {

  const text =
    String(value ?? "");


  if (
    text === "true"
  ) return true;


  if (
    text === "false"
  ) return false;


  if (
    /^-?\d+$/.test(text)
  ) {

    try {
      return BigInt(text);
    } catch {
      return text;
    }

  }


  return text;

}
