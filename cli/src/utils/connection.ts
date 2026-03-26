import { Connection, clusterApiUrl, Cluster } from "@solana/web3.js";

  const CLUSTER: Cluster = (process.env.SOLANA_CLUSTER as Cluster) || "devnet";

  export function getConnection(): Connection {
    const endpoint = process.env.SOLANA_RPC_URL || clusterApiUrl(CLUSTER);
    return new Connection(endpoint, "confirmed");
  }

  export const PROGRAM_ID = process.env.PROGRAM_ID || "DAoFRGExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  