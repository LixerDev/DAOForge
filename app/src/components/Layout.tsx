import { ReactNode } from "react";
  import Link from "next/link";
  import { useWallet } from "@solana/wallet-adapter-react";
  import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
  import { shortenAddress } from "@/utils/constants";

  export default function Layout({ children }: { children: ReactNode }) {
    const { publicKey } = useWallet();
    return (
      <div className="min-h-screen bg-dark-900 text-gray-100">
        <nav className="border-b border-dark-600 bg-dark-800/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-2xl">🏛️</span>
                  <span className="font-bold text-xl text-white">DAOForge</span>
                </Link>
                <div className="hidden md:flex gap-6">
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">DAOs</Link>
                  <Link href="/create" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Create DAO</Link>
                  <a href="https://github.com/LixerDev/DAOForge" target="_blank" rel="noopener noreferrer"
                     className="text-gray-400 hover:text-white transition-colors text-sm font-medium">GitHub</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {publicKey && (
                  <div className="hidden sm:flex items-center gap-2 bg-dark-700 px-3 py-1.5 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-gray-300 font-mono">{shortenAddress(publicKey.toString())}</span>
                  </div>
                )}
                <WalletMultiButton className="!bg-forge-600 !hover:bg-forge-700 !rounded-lg !text-sm !font-medium" />
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        <footer className="border-t border-dark-600 mt-16 py-8 text-center text-gray-500 text-sm">
          <p>DAOForge — Governance on Solana • $FORGE Token • Built with Anchor</p>
        </footer>
      </div>
    );
  }
  