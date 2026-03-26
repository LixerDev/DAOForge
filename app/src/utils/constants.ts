import { PublicKey } from "@solana/web3.js";

  export const PROGRAM_ID = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID || "DAoFRGExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  );

  export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

  export const RPC_ENDPOINT =
    process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
    (NETWORK === "mainnet-beta"
      ? "https://api.mainnet-beta.solana.com"
      : "https://api.devnet.solana.com");

  export const FORGE_DECIMALS = 6;
  export const LAMPORTS_PER_SOL = 1_000_000_000;

  export function formatForge(amount: bigint | number, decimals = FORGE_DECIMALS): string {
    const n = typeof amount === "bigint" ? Number(amount) : amount;
    return (n / 10 ** decimals).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  export function formatSol(lamports: number): string {
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
  }

  export function shortenAddress(address: string, chars = 4): string {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }

  export function timeLeft(endTimestamp: number): string {
    const now = Date.now() / 1000;
    const diff = endTimestamp - now;
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  }
  