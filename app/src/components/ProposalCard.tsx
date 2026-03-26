import Link from "next/link";
  import { timeLeft, formatForge } from "@/utils/constants";

  export interface ProposalInfo {
    address: string;
    daoAddress: string;
    id: number;
    title: string;
    description: string;
    options: string[];
    voteCounts: number[];
    totalVotes: number;
    votingEndsAt: number;
    status: "Active" | "Passed" | "Failed" | "Cancelled" | "Executed";
    winningOption?: number;
  }

  export default function ProposalCard({ proposal }: { proposal: ProposalInfo }) {
    const maxVotes = Math.max(...proposal.voteCounts, 1);

    return (
      <Link href={`/proposal/${proposal.address}`}>
        <div className="card hover:border-forge-600 transition-all cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">#{proposal.id}</span>
                <StatusBadge status={proposal.status} />
              </div>
              <h3 className="text-base font-semibold text-white truncate">{proposal.title}</h3>
            </div>
            <span className="text-xs text-gray-500 ml-3 shrink-0">{timeLeft(proposal.votingEndsAt)}</span>
          </div>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{proposal.description}</p>
          <div className="space-y-2">
            {proposal.options.map((opt, i) => {
              const pct = proposal.totalVotes > 0 ? Math.round((proposal.voteCounts[i] / proposal.totalVotes) * 100) : 0;
              const isWinner = proposal.winningOption === i;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`${isWinner ? "text-forge-400 font-semibold" : "text-gray-400"}`}>{opt}</span>
                    <span className="text-gray-500">{pct}% · {formatForge(proposal.voteCounts[i])} $FORGE</span>
                  </div>
                  <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isWinner ? "bg-forge-500" : "bg-gray-600"}`}
                         style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-600 mt-3">{formatForge(proposal.totalVotes)} total $FORGE voted</p>
        </div>
      </Link>
    );
  }

  function StatusBadge({ status }: { status: ProposalInfo["status"] }) {
    const cls = {
      Active: "badge-active", Passed: "badge-passed", Failed: "badge-failed",
      Cancelled: "badge bg-gray-800 text-gray-400", Executed: "badge bg-purple-900/30 text-purple-400"
    }[status];
    return <span className={cls}>{status}</span>;
  }
  