import {
  createWalletClient,
  custom,
  createPublicClient,
  http
} from "viem";

import {
  mainnet,
  sepolia,
  polygon,
  base,
  arbitrum,
  bsc
} from "viem/chains";


export const NETWORKS = {

  ethereum: {
    name: "Ethereum",
    chain: mainnet,
    rpc: "https://ethereum-rpc.publicnode.com"
  },

  sepolia: {
    name: "Sepolia",
    chain: sepolia,
    rpc: "https://ethereum-sepolia-rpc.publicnode.com"
  },

  polygon: {
    name: "Polygon",
    chain: polygon,
    rpc: "https://polygon-bor-rpc.publicnode.com"
  },

  base: {
    name: "Base",
    chain: base,
    rpc: "https://base-rpc.publicnode.com"
  },

  arbitrum: {
    name: "Arbitrum",
    chain: arbitrum,
    rpc: "https://arbitrum-one-rpc.publicnode.com"
  },

  bsc: {
    name: "BNB Chain",
    chain: bsc,
    rpc: "https://bsc-rpc.publicnode.com"
  }

};


export function getProvider() {

  if (
    typeof window === "undefined" ||
    !window.ethereum
  ) {
    throw new Error(
      "No injected wallet detected. Open SolForge in MetaMask or another compatible wallet."
    );
  }

  return window.ethereum;
}


export async function connectWallet() {

  const provider =
    getProvider();

  const accounts =
    await provider.request({
      method: "eth_requestAccounts"
    });

  if (!accounts?.length) {
    throw new Error(
      "No wallet account was returned."
    );
  }

  return accounts[0];
}


export async function deployContract({

  abi,
  bytecode,
  args = [],
  network = "sepolia",
  onStatus

}) {

  if (!abi) {
    throw new Error(
      "Contract ABI is missing."
    );
  }

  if (!bytecode) {
    throw new Error(
      "Contract bytecode is missing."
    );
  }


  const provider =
    getProvider();


  const selected =
    NETWORKS[network];

  if (!selected) {
    throw new Error(
      "Unsupported network."
    );
  }


  onStatus?.(
    "Requesting wallet account..."
  );


  const walletClient =
    createWalletClient({

      chain:
        selected.chain,

      transport:
        custom(provider)

    });


  const [account] =
    await walletClient.getAddresses();


  if (!account) {
    throw new Error(
      "Wallet account not available."
    );
  }


  onStatus?.(
    `Using ${account}`
  );


  const publicClient =
    createPublicClient({

      chain:
        selected.chain,

      transport:
        http(selected.rpc)

    });


  onStatus?.(
    `Preparing deployment on ${selected.name}...`
  );


  const hash =
    await walletClient.deployContract({

      account,

      abi,

      bytecode:
        bytecode.startsWith("0x")
          ? bytecode
          : `0x${bytecode}`,

      args,

      chain:
        selected.chain

    });


  onStatus?.(
    `Transaction submitted: ${hash}`
  );


  const receipt =
    await publicClient.waitForTransactionReceipt({
      hash
    });


  onStatus?.(
    `Transaction confirmed in block ${receipt.blockNumber}`
  );


  return {

    hash,

    contractAddress:
      receipt.contractAddress,

    blockNumber:
      receipt.blockNumber,

    status:
      receipt.status

  };

}
