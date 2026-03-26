import { Keypair } from "@solana/web3.js";
  import fs from "fs";
  import os from "os";
  import path from "path";

  export function loadWallet(keyPath?: string): Keypair {
    const walletPath = keyPath || process.env.WALLET_PATH || path.join(os.homedir(), ".config", "solana", "id.json");
    if (!fs.existsSync(walletPath)) {
      throw new Error(`Wallet not found at ${walletPath}. Run: solana-keygen new`);
    }
    const raw = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
    return Keypair.fromSecretKey(Uint8Array.from(raw));
  }
  