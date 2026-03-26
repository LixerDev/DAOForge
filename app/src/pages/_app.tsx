import type { AppProps } from "next/app";
  import { useMemo } from "react";
  import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
  import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
  import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
  import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
  import { RPC_ENDPOINT } from "@/utils/constants";
  import "@solana/wallet-adapter-react-ui/styles.css";
  import "@/styles/globals.css";

  export default function App({ Component, pageProps }: AppProps) {
    const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

    return (
      <ConnectionProvider endpoint={RPC_ENDPOINT}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Component {...pageProps} />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }
  