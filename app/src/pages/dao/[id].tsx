import { useRouter } from "next/router";
  import Head from "next/head";
  import Layout from "@/components/Layout";
  import ProposalCard, { ProposalInfo } from "@/components/ProposalCard";
  import TokenStats from "@/components/TokenStats";
  import { formatForge, shortenAddress, timeLeft } from "@/utils/constants";

  // Demo data — replace with useDAO(id) hook after program deployment
  const DEMO_PROPOSALS: ProposalInfo[] = [
    {
      address: "PropXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      daoAddress: "DaoXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      id: 0, title: "Fund Q3 Marketing Campaign",
      description: "Allocate 50 SOL from treasury for community growth and protocol awareness campaigns.",
      options: ["Approve", "Reject", "Abstain"],
      voteCounts: [8_000_000_000, 2_000_000_000, 500_000_000],
      totalVotes: 10_500_000_000,
      votingEndsAt: Math.floor(Date.now() / 1000) + 86400 * 3,
      status: "Active",
    },
    {
      address: "Prop2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      daoAddress: "DaoXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      id: 1, title: "Add Multi-Chain Bridge Support",
      description: "Integrate Wormhole bridge to enable cross-chain $FORGE transfers.",
      options: ["Yes", "No"],
      voteCounts: [9_000_000_000, 1_000_000_000],
      totalVotes: 10_000_000_000,
      votingEndsAt: Math.floor(Date.now() / 1000) - 3600,
      status: "Passed", winningOption: 0,
    },
  ];

  export default function DaoPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
      <>
        <Head><title>DAO Detail — DAOForge</title></Head>
        <Layout>
          <div className="mb-8">
            <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-300 mb-4 flex items-center gap-1">
              ← Back to DAOs
            </button>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">Protocol Treasury DAO</h1>
                  <span className="badge-active">Active</span>
                </div>
                <p className="text-gray-400 mb-1">Governs the main protocol treasury and strategic fund allocation.</p>
                <p className="text-xs text-gray-600 font-mono">{typeof id === "string" ? id : "..."}</p>
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary">Stake $FORGE</button>
                <button className="btn-primary">+ New Proposal</button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Proposals</h2>
                <div className="flex gap-2">
                  {["All", "Active", "Passed", "Failed"].map(f => (
                    <button key={f} className="text-xs px-3 py-1.5 rounded-lg bg-dark-700 text-gray-400 hover:text-white transition-colors">{f}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {DEMO_PROPOSALS.map(p => <ProposalCard key={p.address} proposal={p} />)}
              </div>
            </div>
            <div className="space-y-4">
              <TokenStats totalStaked={12_500_000_000} userStaked={500_000_000} />
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">DAO Config</h3>
                <div className="space-y-2 text-sm">
                  {[
                    ["Quorum", "20%"], ["Threshold", "60%"],
                    ["Voting Period", "7 days"], ["Min Stake to Propose", "1,000 $FORGE"],
                    ["Multi-sig Required", "2 of 3"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-dark-600 last:border-0">
                      <span className="text-gray-500">{k}</span>
                      <span className="text-gray-300">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }
  