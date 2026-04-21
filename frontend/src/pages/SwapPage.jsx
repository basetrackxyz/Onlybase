import React, { useState } from "react";
import {
  ArrowDown,
  Gear,
  CaretDown,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowsLeftRight,
  CurrencyCircleDollar,
  Copy,
  QrCode,
  Plus,
  Wallet as WalletIcon,
  SignOut,
  Check,
} from "@phosphor-icons/react";
import MobileContainer from "../components/MobileContainer";
import ThemeToggle from "../components/ThemeToggle";
import { tokens, transactions } from "../data/mockData";
import { useSmartWallet } from "../lib/useSmartWallet";

export default function SwapPage() {
  const [tab, setTab] = useState("swap");
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("0.5");
  const [copied, setCopied] = useState(false);

  const { address, isConnected, connecting, connectError, connectWallet, disconnect, ethBalance, usdcBalance } = useSmartWallet();

  const rate = fromToken.price / toToken.price;
  const toAmount = fromAmount ? (parseFloat(fromAmount) * rate).toFixed(2) : "0";
  const ethPrice = tokens.find((t) => t.symbol === "ETH")?.price || 0;
  const totalUsd = usdcBalance + ethBalance * ethPrice;

  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

  const copyAddr = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const flip = () => {
    const f = fromToken;
    setFromToken(toToken);
    setToToken(f);
  };

  return (
    <MobileContainer>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-black dark:text-white" data-testid="swap-title">
          Wallet
        </h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center"
              data-testid="wallet-disconnect"
              aria-label="Disconnect wallet"
            >
              <SignOut size={16} />
            </button>
          ) : (
            <button
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center"
              data-testid="wallet-settings"
            >
              <Gear size={18} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {!isConnected ? (
          <ConnectPrompt
            connecting={connecting}
            error={connectError}
            onConnect={connectWallet}
          />
        ) : (
          <>
            <div className="px-4 pt-4">
              <div
                className="bg-black dark:bg-[#111111] dark:ring-1 dark:ring-zinc-800 text-white rounded-2xl p-5 relative overflow-hidden"
                data-testid="wallet-card"
              >
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#0052FF]/20 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#0052FF] flex items-center justify-center text-[10px] font-black">B</div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-300">Base Mainnet · Smart Wallet</span>
                    </div>
                    <button
                      onClick={copyAddr}
                      className="flex items-center gap-1 text-[11px] text-gray-300 bg-white/10 rounded-full px-2.5 py-1 hover:bg-white/20 transition-colors"
                      data-testid="copy-address"
                    >
                      <span className="truncate max-w-[80px]">{shortAddr}</span>
                      {copied ? <Check size={11} weight="bold" /> : <Copy size={11} />}
                    </button>
                  </div>

                  <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Total balance</div>
                  <div className="font-display text-[42px] font-bold tracking-tight leading-none mb-6" data-testid="total-balance">
                    ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <WalletAction Icon={ArrowUpRight} label="Send" testid="wallet-send" />
                    <WalletAction Icon={ArrowDownLeft} label="Receive" testid="wallet-receive" />
                    <WalletAction Icon={ArrowsLeftRight} label="Swap" testid="wallet-swap-action" active />
                    <WalletAction Icon={QrCode} label="Scan" testid="wallet-scan" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex px-4 pt-5 gap-1">
              {["swap", "tokens", "activity"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  data-testid={`tab-${t}`}
                  className={`flex-1 py-2.5 rounded-full text-[13px] font-semibold capitalize transition-all ${
                    tab === t ? "bg-black dark:bg-white text-white dark:text-black" : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="px-4 py-4">
              {tab === "swap" && (
                <div data-testid="swap-interface">
                  <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800">
                    <div className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 font-semibold mb-2">You pay</div>
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="bg-transparent font-display text-4xl font-bold tracking-tight outline-none w-0 flex-1 min-w-0 text-black dark:text-white"
                        data-testid="swap-from-amount"
                      />
                      <TokenSelector token={fromToken} testid="swap-from-token" />
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-zinc-500 mt-2">
                      ≈ ${(parseFloat(fromAmount || 0) * fromToken.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="flex justify-center -my-2 relative z-10">
                    <button
                      onClick={flip}
                      className="w-10 h-10 rounded-full bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-zinc-700 text-black dark:text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-sm"
                      data-testid="swap-flip"
                    >
                      <ArrowDown size={18} weight="bold" />
                    </button>
                  </div>

                  <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800">
                    <div className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 font-semibold mb-2">You receive</div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-display text-4xl font-bold tracking-tight flex-1 min-w-0 truncate text-black dark:text-white">
                        {toAmount}
                      </div>
                      <TokenSelector token={toToken} testid="swap-to-token" />
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-zinc-500 mt-2">
                      ≈ ${(parseFloat(toAmount || 0) * toToken.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="mt-4 px-1 space-y-2 text-[12px]">
                    <Row label="Rate" value={`1 ${fromToken.symbol} ≈ ${rate.toFixed(4)} ${toToken.symbol}`} />
                    <Row label="Network fee" value="~$0.02" />
                    <Row label="Route" value="Base · coming soon" />
                  </div>

                  <button
                    disabled
                    className="w-full bg-[#0052FF]/60 text-white rounded-full py-4 font-semibold text-[15px] mt-5 cursor-not-allowed"
                    data-testid="swap-submit"
                  >
                    Swap coming soon — Aerodrome integration pending
                  </button>
                </div>
              )}

              {tab === "tokens" && (
                <div className="space-y-1" data-testid="tokens-list">
                  <LiveTokenRow symbol="ETH" name="Ethereum" icon="Ξ" color="#627EEA" balance={ethBalance} price={ethPrice} />
                  <LiveTokenRow symbol="USDC" name="USD Coin" icon="$" color="#2775CA" balance={usdcBalance} price={1} />
                  {tokens.filter(t => t.symbol !== "ETH" && t.symbol !== "USDC").map((t) => (
                    <LiveTokenRow key={t.symbol} symbol={t.symbol} name={t.name} icon={t.icon} color={t.color} balance={0} price={t.price} muted />
                  ))}
                </div>
              )}

              {tab === "activity" && (
                <div className="space-y-3" data-testid="activity-list">
                  {transactions.map((t) => <TransactionRow key={t.id} tx={t} />)}
                  <p className="text-center text-[11px] text-gray-400 dark:text-zinc-500 pt-2">
                    Real onchain history coming soon
                  </p>
                </div>
              )}
            </div>

            <div className="h-6" />
          </>
        )}
      </div>
    </MobileContainer>
  );
}

function ConnectPrompt({ connecting, error, onConnect }) {
  return (
    <div className="px-6 pt-12 pb-8 text-center" data-testid="connect-wallet-prompt">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0052FF]/10 mb-5">
        <WalletIcon size={34} weight="fill" className="text-[#0052FF]" />
      </div>
      <h2 className="font-display text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
        Create your Base wallet
      </h2>
      <p className="text-[13px] text-gray-600 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto mb-6">
        A Smart Wallet is built right into OnlyBase — no extensions, no seed phrases. Secured by a passkey on your device.
      </p>

      <button
        onClick={onConnect}
        disabled={connecting}
        className="w-full max-w-xs bg-[#0052FF] text-white rounded-full py-3.5 font-semibold text-[14px] hover:bg-[#0046d6] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mx-auto"
        data-testid="connect-wallet-btn"
      >
        {connecting ? "Opening Coinbase…" : "Create / connect wallet"}
      </button>

      {error && (
        <div className="text-[12px] text-red-500 mt-4 max-w-xs mx-auto">
          {error.shortMessage || error.message}
        </div>
      )}

      <div className="mt-10 grid grid-cols-3 gap-3 max-w-xs mx-auto text-[11px]">
        <Mini label="Passkey secured" />
        <Mini label="Base network" />
        <Mini label="USDC ready" />
      </div>
    </div>
  );
}

function Mini({ label }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 py-3 px-2 text-gray-600 dark:text-zinc-400 font-semibold">
      {label}
    </div>
  );
}

function WalletAction({ Icon, label, testid, active }) {
  return (
    <button
      className="flex flex-col items-center gap-1.5 py-2 rounded-xl active:scale-95 transition-all"
      data-testid={testid}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? "bg-[#0052FF]" : "bg-white/10"}`}>
        <Icon size={18} weight="bold" />
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

function TokenSelector({ token, testid }) {
  return (
    <button
      className="flex items-center gap-2 bg-white dark:bg-[#0A0A0A] text-black dark:text-white rounded-full pl-1 pr-3 py-1 border border-gray-200 dark:border-zinc-700 shrink-0 hover:border-gray-400 dark:hover:border-zinc-500 transition-colors"
      data-testid={testid}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: token.color }}>
        {token.icon}
      </div>
      <span className="font-semibold text-[13px]">{token.symbol}</span>
      <CaretDown size={12} weight="bold" />
    </button>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 dark:text-zinc-500">{label}</span>
      <span className="font-semibold text-black dark:text-white">{value}</span>
    </div>
  );
}

function LiveTokenRow({ symbol, name, icon, color, balance, price, muted }) {
  const value = balance * price;
  return (
    <div
      className={`flex items-center gap-3 py-3 px-2 rounded-xl ${muted ? "opacity-60" : ""}`}
      data-testid={`token-${symbol}`}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] text-black dark:text-white">{symbol}</div>
        <div className="text-[11px] text-gray-500 dark:text-zinc-500">{name}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-[14px] text-black dark:text-white">
          {balance.toFixed(symbol === "USDC" ? 2 : 4)}
        </div>
        <div className="text-[11px] text-gray-500 dark:text-zinc-500">
          ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ tx }) {
  const iconMap = {
    send: { Icon: ArrowUpRight, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", label: `Sent ${tx.token}` },
    receive: { Icon: ArrowDownLeft, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10", label: `Received ${tx.token}` },
    swap: { Icon: ArrowsLeftRight, color: "text-[#0052FF]", bg: "bg-blue-50 dark:bg-blue-500/10", label: `Swap ${tx.tokenIn} → ${tx.tokenOut}` },
    tip: { Icon: CurrencyCircleDollar, color: "text-[#FF4500]", bg: "bg-orange-50 dark:bg-orange-500/10", label: `Tip to @${tx.to}` },
  };
  const { Icon, color, bg, label } = iconMap[tx.type];
  const amount =
    tx.type === "swap"
      ? `${tx.amountIn} ${tx.tokenIn}`
      : `${tx.type === "send" || tx.type === "tip" ? "-" : "+"}${tx.amount} ${tx.token}`;

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${color}`}>
        <Icon size={16} weight="bold" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[13px] truncate text-black dark:text-white">{label}</div>
        <div className="text-[11px] text-gray-500 dark:text-zinc-500">{tx.time}</div>
      </div>
      <div className="font-semibold text-[13px] whitespace-nowrap text-black dark:text-white">{amount}</div>
    </div>
  );
}
