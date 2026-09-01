import DeployPanel
  from "./components/DeployPanel";


import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

import { compileSolidity } from "./compiler/compiler";
import {
  loadProject,
  saveProject
} from "./storage/projectStore";

import "./styles/app.css";

export default function App() {

  const initialProject = useMemo(
    () => loadProject(),
    []
  );

  const [project, setProject] =
    useState(initialProject);

  const [activeFile, setActiveFile] =
    useState(initialProject.activeFile);

  const [output, setOutput] =
    useState([]);

  const [compiled, setCompiled] =
    useState(null);

  const [activePanel, setActivePanel] =
    useState("editor");

  const [compilerVersion, setCompilerVersion] =
    useState("0.8.30");

  const source =
    project.files[activeFile]?.content || "";

  function updateSource(value) {

    const nextProject = {
      ...project,
      activeFile,
      files: {
        ...project.files,
        [activeFile]: {
          ...project.files[activeFile],
          content: value
        }
      }
    };

    setProject(nextProject);
    saveProject(nextProject);
  }


  function compile() {

    setOutput([
      "Starting Solidity compiler...",
      `Compiler: Solidity ${compilerVersion}`,
      `File: ${activeFile}`
    ]);

    try {

      const result =
        compileSolidity(
          source,
          activeFile
        );

      const messages =
        (result.errors || []).map(
          item =>
            `${item.severity.toUpperCase()}: ${item.formattedMessage}`
        );

      setOutput(messages);

      if (!result.success) {

        setCompiled(null);
        setActivePanel("terminal");

        return;
      }

      setCompiled(result.contracts);

      setOutput(prev => [
        ...prev,
        "",
        "✓ Compilation successful.",
        `✓ Contracts: ${Object.keys(result.contracts).join(", ")}`
      ]);

      setActivePanel("compiler");

    } catch (error) {

      setCompiled(null);

      setOutput([
        "COMPILER ERROR",
        "",
        error.message
      ]);

      setActivePanel("terminal");
    }
  }


  function createFile() {

    const name =
      prompt(
        "Enter file path:",
        "contracts/NewContract.sol"
      );

    if (!name) return;

    if (project.files[name]) {

      alert("File already exists.");

      return;
    }

    const nextProject = {

      ...project,

      files: {

        ...project.files,

        [name]: {
          type: "file",
          content:
`// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract NewContract {

}`
        }

      },

      activeFile: name
    };

    setProject(nextProject);
    setActiveFile(name);
    saveProject(nextProject);
  }


  function deleteFile(path) {

    const files = {
      ...project.files
    };

    delete files[path];

    const remaining =
      Object.keys(files);

    if (!remaining.length) return;

    const nextActive =
      remaining[0];

    const nextProject = {
      ...project,
      files,
      activeFile: nextActive
    };

    setProject(nextProject);
    setActiveFile(nextActive);
    saveProject(nextProject);
  }


  function copyText(text) {

    navigator.clipboard
      .writeText(text)
      .then(() => {

        setOutput(prev => [
          ...prev,
          "✓ Copied to clipboard."
        ]);

      })
      .catch(() => {

        setOutput(prev => [
          ...prev,
          "Clipboard access failed."
        ]);

      });
  }


  return (
    <div className="app">

      <header className="header">

        <div className="brand">

          <div className="logo">
            ◆
          </div>

          <div>
            <strong>
              SolForge
            </strong>

            <small>
              Mobile Solidity IDE
            </small>
          </div>

        </div>


        <div className="headerActions">

          <button
            onClick={compile}
            className="compileBtn"
          >
            ▶ Compile
          </button>

          <button
            onClick={() => setActivePanel("wallet")}
            className="walletBtn"
          >
            Connect
          </button>

        </div>

      </header>


      <main className="workspace">


        {/* FILE EXPLORER */}

        <aside className="explorer">

          <div className="panelHeader">

            <span>
              EXPLORER
            </span>

            <button
              onClick={createFile}
            >
              +
            </button>

          </div>


          <div className="fileTree">

            {Object.keys(project.files).map(
              path => (

                <div
                  key={path}
                  className={
                    "file " +
                    (
                      path === activeFile
                        ? "active"
                        : ""
                    )
                  }
                  onClick={() => {
                    setActiveFile(path);
                    setProject({
                      ...project,
                      activeFile: path
                    });
                  }}
                >

                  <span>
                    ◆
                  </span>

                  <label>
                    {path}
                  </label>

                  {Object.keys(project.files).length > 1 && (

                    <button
                      className="deleteFile"
                      onClick={e => {
                        e.stopPropagation();
                        deleteFile(path);
                      }}
                    >
                      ×
                    </button>

                  )}

                </div>

              )
            )}

          </div>

        </aside>


        {/* EDITOR */}

        <section className="editorPanel">

          <div className="editorHeader">

            <span>
              ◆ {activeFile}
            </span>

            <span className="language">
              Solidity
            </span>

          </div>


          <div className="editor">

            <Editor

              height="100%"

              language="solidity"

              theme="vs-dark"

              value={source}

              onChange={value =>
                updateSource(
                  value || ""
                )
              }

              options={{

                fontSize: 13,

                minimap: {
                  enabled: false
                },

                automaticLayout: true,

                wordWrap: "off",

                tabSize: 4,

                insertSpaces: true,

                lineNumbers: "on",

                folding: true,

                renderWhitespace: "selection",

                smoothScrolling: true,

                padding: {
                  top: 12
                }

              }}

            />

          </div>

        </section>


        {/* SIDE PANEL */}

        <aside className="sidePanel">

          <div className="panelHeader">
            COMPILER
          </div>


          <div className="sideContent">

            <label>
              Solidity Version
            </label>

            <select
              value={compilerVersion}
              onChange={e =>
                setCompilerVersion(
                  e.target.value
                )
              }
            >

              <option>
                0.8.30
              </option>

              <option>
                0.8.26
              </option>

              <option>
                0.8.24
              </option>

              <option>
                0.8.20
              </option>

            </select>


            <button
              className="fullBtn"
              onClick={compile}
            >
              Compile Contract
            </button>


            {compiled && (

              <div className="compiledList">

                <h4>
                  Contracts
                </h4>

                {Object.keys(compiled).map(
                  name => (

                    <div
                      className="contractItem"
                      key={name}
                    >
                      ◆ {name}
                    </div>

                  )
                )}

              </div>

            )}


            {compiled && (

              <>

                <button
                  className="secondaryBtn"
                  onClick={() =>
                    setActivePanel("abi")
                  }
                >
                  ABI
                </button>

                <button
                  className="secondaryBtn"
                  onClick={() =>
                    setActivePanel("bytecode")
                  }
                >
                  Bytecode
                </button>

                <button
                  className="deployBtn"
                  onClick={() =>
                    setActivePanel("deploy")
                  }
                >
                  🚀 Deploy
                </button>

              </>

            )}

          </div>

        </aside>

      </main>


      {/* OUTPUT */}

      <section className="terminal">

        <div className="terminalHeader">

          <span>
            TERMINAL
          </span>

          <button
            onClick={() =>
              setOutput([])
            }
          >
            Clear
          </button>

        </div>


        <pre>

          {output.length
            ? output.join("\n")
            : "Ready."}

        </pre>

      </section>


      {/* MOBILE PANEL */}

      {activePanel !== "editor" && (

        <div className="mobileSheet">

          <div className="sheetHeader">

            <strong>
              {activePanel.toUpperCase()}
            </strong>

            <button
              onClick={() =>
                setActivePanel("editor")
              }
            >
              ×
            </button>

          </div>


          {activePanel === "compiler" && (
            <CompilerResult
              compiled={compiled}
              copyText={copyText}
            />
          )}


          {activePanel === "abi" && (
            <AbiPanel
              compiled={compiled}
              copyText={copyText}
            />
          )}


          {activePanel === "bytecode" && (
            <BytecodePanel
              compiled={compiled}
              copyText={copyText}
            />
          )}


          {activePanel === "deploy" && (
            <DeployPanel />
          )}


          {activePanel === "wallet" && (
            <WalletPanel />
          )}


          {activePanel === "terminal" && (
            <pre className="sheetTerminal">
              {output.join("\n")}
            </pre>
          )}

        </div>

      )}


      {/* MOBILE NAV */}

      <nav className="mobileNav">

        <button
          onClick={() =>
            setActivePanel("editor")
          }
        >
          <span>⌘</span>
          Editor
        </button>

        <button
          onClick={() =>
            setActivePanel("terminal")
          }
        >
          <span>▣</span>
          Console
        </button>

        <button
          onClick={() =>
            setActivePanel("compiler")
          }
        >
          <span>⚙</span>
          Compile
        </button>

        <button
          onClick={() =>
            setActivePanel("deploy")
          }
        >
          <span>🚀</span>
          Deploy
        </button>

        <button
          onClick={() =>
            setActivePanel("wallet")
          }
        >
          <span>◈</span>
          Wallet
        </button>

      </nav>

    </div>
  );
}


/* =========================
   COMPILER RESULT
========================= */

function CompilerResult({
  compiled,
  copyText
}) {

  if (!compiled) {

    return (
      <div className="empty">
        Compile a contract first.
      </div>
    );
  }

  return (

    <div className="resultList">

      {Object.entries(compiled).map(
        ([name, contract]) => (

          <div
            className="resultCard"
            key={name}
          >

            <h3>
              ◆ {name}
            </h3>

            <p>
              ABI entries:
              {" "}
              {contract.abi.length}
            </p>

            <p>
              Bytecode:
              {" "}
              {contract.bytecode.length / 2}
              {" "}bytes
            </p>

            <button
              onClick={() =>
                copyText(
                  JSON.stringify(
                    contract.abi,
                    null,
                    2
                  )
                )
              }
            >
              Copy ABI
            </button>

          </div>

        )
      )}

    </div>
  );
}


/* =========================
   ABI
========================= */

function AbiPanel({
  compiled,
  copyText
}) {

  if (!compiled) {

    return (
      <div className="empty">
        Compile first to generate ABI.
      </div>
    );
  }

  const first =
    Object.values(compiled)[0];

  const abi =
    JSON.stringify(
      first.abi,
      null,
      2
    );

  return (

    <div className="codeViewer">

      <button
        onClick={() =>
          copyText(abi)
        }
      >
        Copy ABI
      </button>

      <pre>
        {abi}
      </pre>

    </div>
  );
}


/* =========================
   BYTECODE
========================= */

function BytecodePanel({
  compiled,
  copyText
}) {

  if (!compiled) {

    return (
      <div className="empty">
        Compile first to generate bytecode.
      </div>
    );
  }

  const first =
    Object.values(compiled)[0];

  return (

    <div className="codeViewer">

      <button
        onClick={() =>
          copyText(
            first.bytecode
          )
        }
      >
        Copy Creation Bytecode
      </button>

      <pre>
        {first.bytecode || "0x"}
      </pre>


      <button
        onClick={() =>
          copyText(
            first.deployedBytecode
          )
        }
      >
        Copy Runtime Bytecode
      </button>

      <pre>
        {first.deployedBytecode || "0x"}
      </pre>

    </div>
  );
}


/* =========================
   DEPLOY PANEL
========================= */

function DeployPanel() {

  return (

    <div className="deployPanel">

      <h3>
        Deploy Contract
      </h3>

      <p>
        Connect a wallet and select a
        compiled contract to deploy.
      </p>

      <button className="deployBtn">
        Connect Wallet
      </button>

      <p className="warning">
        A blockchain transaction requires
        wallet confirmation.
      </p>

    </div>
  );
}


/* =========================
   WALLET
========================= */

function WalletPanel() {

  return (

    <div className="walletPanel">

      <h3>
        Wallet
      </h3>

      <button className="walletOption">
        🦊 MetaMask
      </button>

      <button className="walletOption">
        🔗 WalletConnect
      </button>

      <p>
        Your private key or seed phrase
        is never requested by SolForge.
      </p>

    </div>
  );
}
