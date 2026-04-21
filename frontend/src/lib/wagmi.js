import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

// Coinbase Smart Wallet config — passkey-based, no browser extension needed.
// `preference: "smartWalletOnly"` forces the embedded smart wallet flow.
export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "OnlyBase",
      appLogoUrl: "https://static.prod-images.emergentagent.com/jobs/96d99d58-6e9a-4982-a9ae-b42ab2b51d16/images/5040964c87025d2c91a6c45d841eb58ab57a242a23d0707599ceff4c9f1421d2.png",
      preference: "smartWalletOnly",
    }),
  ],
  transports: {
    [base.id]: http(process.env.REACT_APP_BASE_RPC_URL || "https://mainnet.base.org"),
  },
});

// USDC on Base
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const USDC_DECIMALS = 6;

// Minimal ERC20 ABI (balanceOf + transfer + decimals)
export const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
];

export const PLATFORM_WALLET_ADDRESS = "0x2805e9dbce2839c5feae858723f9499f15fd88cf";
