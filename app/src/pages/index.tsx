import { useState } from "react";
  import Head from "next/head";
  import Layout from "@/components/Layout";
  import DAOCard, { DAOInfo } from "@/components/DAOCard";

  // Placeholder data — replace with useDAOs() hook once program is deployed
  const DEMO_DAOS: DAOInfo[] = [
    {
      address: "DaoXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      name: "Protocol Treasury DAO",
      description: "Governs the main protocol treasury and strategic fund allocation across ecosystem initiatives.",
      totalStaked: 12_500_000_000, // 12,500 $FORGE
      proposalCount: 8,
      quorumPercentage: 20,
      approvalThreshold: 60,
      votingPeriodDays: 7,
    },
    {
      address: "Dao2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      name: "Developer Grant DAO",
      description: "Community-driven grants for builders creating open-source tools and integrations.",
      totalStaked: 8_000_000_000,
      proposalCount: 14,
      quorumPercentage: 15,
      approvalThreshold: 51,
      votingPeriodDays: 5,
    },
  ];

  export default function Home() {
    const [search, setSearch] = useState("");
    const filtered = DEMO_DAOS.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <>
        <Head>
          <title>DAOForge — Governance on Solana</title>
          <meta name="description" content="Create and manage DAOs on Solana with $FORGE token voting" />
        </Head>
        <Layout>
          {/* Hero */}
          <div className="text-center py-16 mb-12">
            <div className="inline-flex items-center gap-2 bg-forge-900/30 border border-forge-800 rounded-full px-4 py-1.5 mb-6">
              <span className="text-forge-400 text-sm font-medium">Built on Solana</span>
              <span className="text-xs bg-forge-600 text-white px-2 py-0.5 rounded-full">Devnet</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Governance for <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-400 to-purple-400">Everyone</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Create DAOs, submit proposals, vote with <strong className="text-forge-400">$FORGE</strong> tokens, and manage multi-sig treasuries — all on Solana.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href="/create" className="btn-primary text-base px-6 py-3">Create a DAO</a>
              <a href="https://github.com/LixerDev/DAOForge" target="_blank" rel="noopener noreferrer"
                 className="btn-secondary text-base px-6 py-3">View on GitHub</a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Active DAOs", value: DEMO_DAOS.length.toString() },
              { label: "Total $FORGE Staked", value: "20,500" },
              { label: "Proposals Created", value: "22" },
              { label: "Network", value: "Solana Devnet" },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* DAO List */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Active DAOs</h2>
            <input
              type="text"
              placeholder="Search DAOs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-dark-700 border border-dark-500 rounded-lg px-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-forge-600 w-64"
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(dao => <DAOCard key={dao.address} dao={dao} />)}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 text-gray-500">
                <p className="text-5xl mb-4">🏛️</p>
                <p>No DAOs found. <a href="/create" className="text-forge-400 hover:underline">Create the first one!</a></p>
              </div>
            )}
          </div>
        </Layout>
      </>
    );
  }
  