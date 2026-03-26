import { useWallet } from "@solana/wallet-adapter-react";
  import { formatForge } from "@/utils/constants";

  interface Props {
    totalStaked: number;
    userStaked?: number;
    totalSupply?: number;
  }

  export default function TokenStats({ totalStaked, userStaked = 0, totalSupply = 1_000_000_000_000 }: Props) {
    const { publicKey } = useWallet();
    const stakedPct = totalSupply > 0 ? (totalStaked / totalSupply * 100).toFixed(1) : "0";
    const votingPower = totalStaked > 0 ? (userStaked / totalStaked * 100).toFixed(2) : "0";

    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <span className="text-forge-400 text-base">$</span> FORGE Token Stats
        </h3>
        <div className="space-y-3">
          <Row label="Total Supply" value={`${formatForge(totalSupply)} $FORGE`} />
          <Row label="Total Staked" value={`${formatForge(totalStaked)} $FORGE (${stakedPct}%)`} highlight />
          {publicKey && <Row label="Your Stake" value={`${formatForge(userStaked)} $FORGE`} />}
          {publicKey && <Row label="Your Voting Power" value={`${votingPower}% of votes`} highlight />}
        </div>
      </div>
    );
  }

  function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
      <div className="flex justify-between items-center py-2 border-b border-dark-600 last:border-0">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`text-sm font-medium ${highlight ? "text-forge-400" : "text-gray-300"}`}>{value}</span>
      </div>
    );
  }
  