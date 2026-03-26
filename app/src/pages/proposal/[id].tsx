import { useRouter } from "next/router";
  import Head from "next/head";
  import { useWallet } from "@solana/wallet-adapter-react";
  import Layout from "@/components/Layout";
  import { formatForge, timeLeft } from "@/utils/constants";

  const DEMO_PROPOSAL = {
    id: 0, title: "Fund Q3 Marketing Campaign",
    description: `This proposal requests 50 SOL from the DAO treasury to fund Q3 marketing efforts.

  **Scope:**
  - Community ambassador program (20 SOL)
  - Content creation and social campaigns (15 SOL)
  - Hackathon sponsorship (15 SOL)

  **Expected Outcome:** 2x growth in active DAO members over Q3 2025.

  **Budget Breakdown:** Full breakdown available at the linked forum post.`,
    options: ["Approve", "Reject", "Abstain"],
    voteCounts: [8_000_000_000, 2_000_000_000, 500_000_000],
    totalVotes: 10_500_000_000,
    votingEndsAt: Math.floor(Date.now() / 1000) + 86400 * 3,
    status: "Active", proposer: "5Tz1N...Kp2X",
    link: "https://forum.daoforge.xyz/t/q3-marketing-proposal/42",
  };

  export default function ProposalPage() {
    const router = useRouter();
    const { publicKey } = useWallet();

    const maxVotes = Math.max(...DEMO_PROPOSAL.voteCounts);
    const colors = ["bg-green-500", "bg-red-500", "bg-gray-500"];

    return (
      <>
        <Head><title>{DEMO_PROPOSAL.title} — DAOForge</title></Head>
        <Layout>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-300 mb-6 flex items-center gap-1">← Back</button>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-gray-500">#{DEMO_PROPOSAL.id}</span>
                  <span className="badge-active">Active</span>
                  <span className="text-xs text-gray-500 ml-auto">{timeLeft(DEMO_PROPOSAL.votingEndsAt)}</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-3">{DEMO_PROPOSAL.title}</h1>
                <p className="text-xs text-gray-500 mb-4">Proposed by <span className="font-mono">{DEMO_PROPOSAL.proposer}</span></p>
                <div className="prose prose-invert prose-sm max-w-none">
                  {DEMO_PROPOSAL.description.split("\n").map((line, i) => (
                    <p key={i} className={line.startsWith("**") ? "font-semibold text-gray-200" : "text-gray-400"}>{line.replace(/**/g, "")}</p>
                  ))}
                </div>
                {DEMO_PROPOSAL.link && (
                  <a href={DEMO_PROPOSAL.link} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 mt-4 text-forge-400 text-sm hover:underline">
                    📖 View full discussion →
                  </a>
                )}
              </div>

              {/* Voting */}
              <div className="card">
                <h2 className="text-base font-semibold text-white mb-4">Cast Your Vote</h2>
                {!publicKey ? (
                  <p className="text-gray-500 text-sm">Connect your wallet to vote.</p>
                ) : (
                  <div className="space-y-3">
                    {DEMO_PROPOSAL.options.map((opt, i) => (
                      <button key={i}
                        className="w-full text-left bg-dark-700 hover:bg-dark-600 border border-dark-500 hover:border-forge-600 rounded-xl p-4 transition-all group">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-200 group-hover:text-white">{opt}</span>
                          <span className="text-sm text-gray-500">
                            {DEMO_PROPOSAL.totalVotes > 0
                              ? Math.round(DEMO_PROPOSAL.voteCounts[i] / DEMO_PROPOSAL.totalVotes * 100) + "%"
                              : "0%"}
                          </span>
                        </div>
                      </button>
                    ))}
                    <p className="text-xs text-gray-600 mt-2">Your voting power equals your staked $FORGE amount.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Live Results */}
            <div className="space-y-4">
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Live Results</h3>
                <div className="space-y-4">
                  {DEMO_PROPOSAL.options.map((opt, i) => {
                    const pct = DEMO_PROPOSAL.totalVotes > 0
                      ? Math.round(DEMO_PROPOSAL.voteCounts[i] / DEMO_PROPOSAL.totalVotes * 100) : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-300">{opt}</span>
                          <span className="text-gray-400">{pct}%</span>
                        </div>
                        <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${colors[i] || "bg-blue-500"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{formatForge(DEMO_PROPOSAL.voteCounts[i])} $FORGE</p>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-dark-600 mt-4 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Voted</span>
                    <span className="text-gray-300">{formatForge(DEMO_PROPOSAL.totalVotes)} $FORGE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }
  