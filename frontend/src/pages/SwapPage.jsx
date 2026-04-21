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
} from "@phosphor-icons/react";
import MobileContainer from "../components/MobileContainer";
import { currentUser, tokens, transactions } from "../data/mockData";

export default function SwapPage() {
  const [tab, setTab] = useState("swap"); // wallet | swap
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("0.5");

  const rate = fromToken.price / toToken.price;
  const toAmount = fromAmount ? (parseFloat(fromAmount) * rate).toFixed(2) : "0";

  const flip = () => {
    const f = fromToken;
    setFromToken(toToken);
    setToToken(f);
  };

  return (
    <MobileContainer>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight" data-testid="swap-title">
          Wallet
        </h1>
        <button
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
          data-testid="wallet-settings"
        >
          <Gear size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Wallet card */}
        <div className="px-4 pt-4">
          <div
            className="bg-black text-white rounded-2xl p-5 relative overflow-hidden"
            data-testid="wallet-card"
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#0052FF]/20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0052FF] flex items-center justify-center text-[10px] font-black">
                    B
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-300">
                    Base Mainnet
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-300 bg-white/10 rounded-full px-2.5 py-1">
                  <span className="truncate max-w-[80px]">{currentUser.walletAddress}</span>
                  <Copy size={11} />
                </div>
              </div>

              <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Total balance
              </div>
              <div className="font-display text-[42px] font-bold tracking-tight leading-none mb-6">
                ${currentUser.balance.total_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

        {/* Tabs */}
        <div className="flex px-4 pt-5 gap-1">
          <button
            onClick={() => setTab("swap")}
            data-testid="tab-swap"
            className={`flex-1 py-2.5 rounded-full text-[13px] font-semibold transition-all ${
              tab === "swap" ? "bg-black text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Swap
          </button>
          <button
            onClick={() => setTab("tokens")}
            data-testid="tab-tokens"
            className={`flex-1 py-2.5 rounded-full text-[13px] font-semibold transition-all ${
              tab === "tokens" ? "bg-black text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Tokens
          </button>
          <button
            onClick={() => setTab("activity")}
            data-testid="tab-activity"
            className={`flex-1 py-2.5 rounded-full text-[13px] font-semibold transition-all ${
              tab === "activity" ? "bg-black text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Activity
          </button>
        </div>

        {/* Tab content */}
        <div className="px-4 py-4">
          {tab === "swap" && (
            <div data-testid="swap-interface">
              {/* From */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                  You pay
                </div>
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="bg-transparent font-display text-4xl font-bold tracking-tight outline-none w-0 flex-1 min-w-0"
                    data-testid="swap-from-amount"
                  />
                  <TokenSelector token={fromToken} testid="swap-from-token" />
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  ≈ ${(parseFloat(fromAmount || 0) * fromToken.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Flip */}
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  onClick={flip}
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-sm"
                  data-testid="swap-flip"
                >
                  <ArrowDown size={18} weight="bold" />
                </button>
              </div>

              {/* To */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                  You receive
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-display text-4xl font-bold tracking-tight flex-1 min-w-0 truncate">
                    {toAmount}
                  </div>
                  <TokenSelector token={toToken} testid="swap-to-token" />
                </div>
                <div className="text-[11px] text-gray-400 mt-2">
                  ≈ ${(parseFloat(toAmount || 0) * toToken.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 px-1 space-y-2 text-[12px]">
                <Row label="Rate" value={`1 ${fromToken.symbol} ≈ ${rate.toFixed(4)} ${toToken.symbol}`} />
                <Row label="Network fee" value="~$0.02" />
                <Row label="Slippage" value="0.5%" />
                <Row label="Route" value="Base · Aerodrome" />
              </div>

              <button
                className="w-full bg-[#0052FF] text-white rounded-full py-4 font-semibold text-[15px] mt-5 hover:bg-[#0046d6] active:scale-[0.98] transition-all"
                data-testid="swap-submit"
              >
                Review swap
              </button>
              <p className="text-[11px] text-center text-gray-400 mt-3">
                Trading any token on Base · powered by onchain liquidity
              </p>
            </div>
          )}

          {tab === "tokens" && (
            <div className="space-y-1" data-testid="tokens-list">
              {tokens.map((t) => (
                <div
                  key={t.symbol}
                  className="flex items-center gap-3 py-3 px-2 rounded-xl active:bg-gray-50"
                  data-testid={`token-${t.symbol}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px]">{t.symbol}</div>
                    <div className="text-[11px] text-gray-500">{t.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[14px]">
                      ${t.price < 1 ? t.price.toFixed(4) : t.price.toLocaleString()}
                    </div>
                    <div
                      className={`text-[11px] font-semibold ${
                        t.change >= 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {t.change >= 0 ? "+" : ""}
                      {t.change}%
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="w-full mt-3 flex items-center justify-center gap-2 py-3 text-[13px] font-semibold text-gray-600 border border-dashed border-gray-200 rounded-full hover:border-gray-400"
                data-testid="token-import"
              >
                <Plus size={14} weight="bold" />
                Import token
              </button>
            </div>
          )}

          {tab === "activity" && (
            <div className="space-y-3" data-testid="activity-list">
              {transactions.map((t) => (
                <TransactionRow key={t.id} tx={t} />
              ))}
            </div>
          )}
        </div>

        <div className="h-6" />
      </div>
    </MobileContainer>
  );
}

function WalletAction({ Icon, label, testid, active }) {
  return (
    <button
      className="flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-white/5 active:scale-95 transition-all"
      data-testid={testid}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          active ? "bg-[#0052FF]" : "bg-white/10"
        }`}
      >
        <Icon size={18} weight="bold" />
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

function TokenSelector({ token, testid }) {
  return (
    <button
      className="flex items-center gap-2 bg-white rounded-full pl-1 pr-3 py-1 border border-gray-200 shrink-0 hover:border-gray-400 transition-colors"
      data-testid={testid}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs"
        style={{ backgroundColor: token.color }}
      >
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
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-black">{value}</span>
    </div>
  );
}

function TransactionRow({ tx }) {
  const iconMap = {
    send: { Icon: ArrowUpRight, color: "text-red-500", bg: "bg-red-50", label: `Sent ${tx.token}` },
    receive: { Icon: ArrowDownLeft, color: "text-green-600", bg: "bg-green-50", label: `Received ${tx.token}` },
    swap: { Icon: ArrowsLeftRight, color: "text-[#0052FF]", bg: "bg-blue-50", label: `Swap ${tx.tokenIn} → ${tx.tokenOut}` },
    tip: { Icon: CurrencyCircleDollar, color: "text-[#FF4500]", bg: "bg-orange-50", label: `Tip to @${tx.to}` },
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
        <div className="font-semibold text-[13px] truncate">{label}</div>
        <div className="text-[11px] text-gray-500">{tx.time}</div>
      </div>
      <div className="font-semibold text-[13px] whitespace-nowrap">{amount}</div>
    </div>
  );
}
