import {
  createConfig,
  http
} from "wagmi";

import {
  mainnet,
  sepolia,
  polygon,
  base,
  arbitrum,
  bsc
} from "wagmi/chains";

import {
  injected
} from "wagmi/connectors";

export const wagmiConfig = createConfig({

  chains: [
    mainnet,
    sepolia,
    polygon,
    base,
    arbitrum,
    bsc
  ],

  connectors: [
    injected()
  ],

  transports: {

    [mainnet.id]:
      http(),

    [sepolia.id]:
      http(),

    [polygon.id]:
      http(),

    [base.id]:
      http(),

    [arbitrum.id]:
      http(),

    [bsc.id]:
      http()

  }

});
