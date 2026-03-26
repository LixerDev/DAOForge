import Link from "next/link";
  import { formatForge, shortenAddress } from "@/utils/constants";

  export interface DAOInfo {
    address: string;
    name: string;
    description: string;
    totalStaked: number;
    proposalCount: number;
    quorumPercentage: number;
    approvalThreshold: number;
    votingPeriodDays: number;
  }

  export default function DAOCard({ dao }: { dao: DAOInfo }) {
    return (
      <Link href={`/dao/${dao.address}`}>
        <div className="card hover:border-forge-600 hover:shadow-forge-600/10 hover:shadow-lg transition-all cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-forge-400 transition-colors">{dao.name}</h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{shortenAddress(dao.address)}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-forge-900/30 border border-forge-800 rounded-full px-3 py-1">
              <span className="text-forge-400 font-bold text-sm">$FORGE</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-5 line-clamp-2">{dao.description}</p>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Total Staked" value={`${formatForge(dao.totalStaked)} $FORGE`} />
            <Stat label="Proposals" value={dao.proposalCount.toString()} />
            <Stat label="Quorum" value={`${dao.quorumPercentage}%`} />
            <Stat label="Threshold" value={`${dao.approvalThreshold}%`} />
          </div>
        </div>
      </Link>
    );
  }

  function Stat({ label, value }: { label: string; value: string }) {
    return (
      <div className="bg-dark-700 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-200">{value}</p>
      </div>
    );
  }
  