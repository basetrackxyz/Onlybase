// Mock data for OnlyBase - crypto creator platform on Base

export const currentUser = {
  id: "u_001",
  name: "Alex Rivera",
  handle: "alexrivera",
  avatar: "https://images.pexels.com/photos/16400336/pexels-photo-16400336.jpeg",
  verified: false,
  walletAddress: "0x742d...4F1a",
  balance: {
    eth: 0.842,
    usdc: 2450.30,
    total_usd: 4820.17,
  },
};

export const creators = [
  {
    id: "c_001",
    name: "Maya Chen",
    handle: "mayaonchain",
    avatar: "https://via.placeholder.com/256/7480323ee5f50e9857985ee0f21d48a5970bbe28d73",
    banner: "https://images.unsplash.com/photo-1642432556591-72cbc671b707",
    bio: "Crypto educator. Base native. Teaching you how to navigate L2s with zero fluff.",
    verified: true,
    followers: 48230,
    posts: 312,
    messagePrice: 12,
    category: "Education",
    walletAddress: "0xa1b2...c3d4",
  },
  {
    id: "c_002",
    name: "Tariq Holmes",
    handle: "tariqtrades",
    avatar: "https://via.placeholder.com/256/2787247fb2a9fbce70fe1624c097be0685",
    banner: "https://images.unsplash.com/photo-1732111816779-aeec50f788ba",
    bio: "Alpha hunter. 7-figure trader. Free posts, premium DMs.",
    verified: true,
    followers: 91020,
    posts: 742,
    messagePrice: 25,
    category: "Trading",
    walletAddress: "0xe5f6...a7b8",
  },
  {
    id: "c_003",
    name: "Luna Park",
    handle: "lunapark_eth",
    avatar: "https://images.pexels.com/photos/9547298/pexels-photo-9547298.jpeg",
    banner: "https://images.pexels.com/photos/30767247/pexels-photo-30767247.jpeg",
    bio: "NFT curator · Onchain artist · Base OG since day 1",
    verified: true,
    followers: 22410,
    posts: 198,
    messagePrice: 8,
    category: "NFT",
    walletAddress: "0x9d8c...7b6a",
  },
  {
    id: "c_004",
    name: "DeFi Dan",
    handle: "defidan",
    avatar: "https://images.pexels.com/photos/16400336/pexels-photo-16400336.jpeg",
    banner: "https://images.unsplash.com/photo-1642432556591-72cbc671b707",
    bio: "Yield farmer. Liquidity whisperer. Sharing weekly alpha drops.",
    verified: true,
    followers: 16780,
    posts: 124,
    messagePrice: 15,
    category: "DeFi",
    walletAddress: "0x3c4d...5e6f",
  },
];

export const posts = [
  {
    id: "p_001",
    creatorId: "c_002",
    type: "image",
    content: "Called the BTC breakout 48h ago. Chart setup in the thread below. This is why onchain data > mainstream news every single time. 🧵",
    mediaUrl: "https://images.unsplash.com/photo-1732111816779-aeec50f788ba",
    likes: 2843,
    comments: 142,
    tips: 87,
    createdAt: "2h",
  },
  {
    id: "p_002",
    creatorId: "c_001",
    type: "text",
    content: "Quick tip for Base newcomers:\n\nBridge small first. Get familiar with the gas mechanics before moving real size. L2s are cheap but not free — and the first tx can feel weird.\n\nSave this. Thank me later.",
    mediaUrl: null,
    likes: 1284,
    comments: 73,
    tips: 44,
    createdAt: "5h",
  },
  {
    id: "p_003",
    creatorId: "c_003",
    type: "image",
    content: "New drop live on Base. Hand-crafted 1/1. Zero hype, just art. Link pinned.",
    mediaUrl: "https://images.unsplash.com/photo-1642432556591-72cbc671b707",
    likes: 932,
    comments: 58,
    tips: 34,
    createdAt: "8h",
  },
  {
    id: "p_004",
    creatorId: "c_004",
    type: "image",
    content: "Weekly yield report is out. Aerodrome still cooking. Morpho flipped spark this week. Full breakdown for subscribers — but the chart speaks for itself.",
    mediaUrl: "https://images.pexels.com/photos/30767247/pexels-photo-30767247.jpeg",
    likes: 1692,
    comments: 91,
    tips: 62,
    createdAt: "12h",
  },
  {
    id: "p_005",
    creatorId: "c_002",
    type: "text",
    content: "Market structure flipped bullish at the 4H level. Not financial advice, but I'm positioned. DMs open for subs.",
    mediaUrl: null,
    likes: 812,
    comments: 29,
    tips: 18,
    createdAt: "1d",
  },
];

export const tokens = [
  { symbol: "ETH", name: "Ethereum", price: 3824.12, change: 2.4, icon: "Ξ", color: "#627EEA" },
  { symbol: "USDC", name: "USD Coin", price: 1.00, change: 0.01, icon: "$", color: "#2775CA" },
  { symbol: "cbBTC", name: "Coinbase BTC", price: 96420.55, change: 1.8, icon: "₿", color: "#F7931A" },
  { symbol: "AERO", name: "Aerodrome", price: 0.742, change: -3.2, icon: "A", color: "#0052FF" },
  { symbol: "DEGEN", name: "Degen", price: 0.0082, change: 12.4, icon: "D", color: "#A855F7" },
  { symbol: "BRETT", name: "Brett", price: 0.098, change: -1.4, icon: "B", color: "#1D9BF0" },
  { symbol: "HIGHER", name: "Higher", price: 0.031, change: 5.7, icon: "H", color: "#10B981" },
  { symbol: "MOXIE", name: "Moxie", price: 0.0014, change: -0.8, icon: "M", color: "#FF4500" },
];

export const conversations = [
  {
    id: "conv_001",
    creatorId: "c_002",
    subscribed: false,
    lastMessage: "Subscribe to unlock message with Tariq",
    lastTime: "now",
    unread: 0,
  },
  {
    id: "conv_002",
    creatorId: "c_001",
    subscribed: true,
    lastMessage: "Yes, the gas estimate looks right. Go for it.",
    lastTime: "2m",
    unread: 2,
  },
  {
    id: "conv_003",
    creatorId: "c_003",
    subscribed: false,
    lastMessage: "Subscribe to message Luna",
    lastTime: "—",
    unread: 0,
  },
  {
    id: "conv_004",
    creatorId: "c_004",
    subscribed: true,
    lastMessage: "Sent you the vault address. Check your inbox.",
    lastTime: "1h",
    unread: 0,
  },
];

export const transactions = [
  { id: "t1", type: "receive", token: "USDC", amount: 250, from: "0x91f...23a", time: "2h ago" },
  { id: "t2", type: "swap", tokenIn: "ETH", tokenOut: "USDC", amountIn: 0.1, amountOut: 382.4, time: "1d ago" },
  { id: "t3", type: "send", token: "ETH", amount: 0.05, to: "0x3f4...88c", time: "2d ago" },
  { id: "t4", type: "tip", token: "USDC", amount: 10, to: "mayaonchain", time: "3d ago" },
];

export const categories = ["All", "Trading", "DeFi", "NFT", "Education", "Alpha", "News"];

export const trending = creators.slice(0, 4);
