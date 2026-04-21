import { useAccount, useBalance, useConnect, useDisconnect, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { USDC_ADDRESS, USDC_DECIMALS, ERC20_ABI } from "./wagmi";
import { useEffect, useRef } from "react";
import api from "./api";

/**
 * Returns wallet state + helpers.
 * Also persists the connected address to the backend user record on connect.
 */
export function useSmartWallet() {
  const { address, isConnected, status } = useAccount();
  const { connect, connectors, isPending: connecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  // Native ETH balance on Base
  const { data: ethBalance } = useBalance({
    address,
    query: { enabled: !!address, refetchInterval: 30_000 },
  });

  // USDC balance on Base
  const { data: usdcRaw } = useReadContract({
    abi: ERC20_ABI,
    address: USDC_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 30_000 },
  });

  const usdcBalance = usdcRaw ? parseFloat(formatUnits(usdcRaw, USDC_DECIMALS)) : 0;
  const ethBalanceFormatted = ethBalance ? parseFloat(ethBalance.formatted) : 0;

  const cb = connectors.find((c) => c.id === "coinbaseWalletSDK" || c.name?.toLowerCase().includes("coinbase")) || connectors[0];

  const connectWallet = () => {
    if (cb) connect({ connector: cb });
  };

  // Persist wallet address to backend once connected
  const persisted = useRef(null);
  useEffect(() => {
    if (!isConnected || !address) return;
    if (persisted.current === address) return;
    persisted.current = address;
    api.patch("/users/me/wallet", { wallet_address: address }).catch(() => {
      persisted.current = null;
    });
  }, [isConnected, address]);

  return {
    address,
    isConnected,
    status,
    connecting,
    connectError,
    connectWallet,
    disconnect,
    ethBalance: ethBalanceFormatted,
    usdcBalance,
  };
}
