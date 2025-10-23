import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors'
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export const wagmiConfig = createConfig({
  chains: [base], // Base Mainnet!
  transports: {
    [base.id]: http(),
  },
  connectors: [
    injected(),
    farcasterMiniApp()
  ]
});
