use anchor_lang::prelude::*;

  // Maximum sizes for variable-length fields
  pub const MAX_NAME_LEN: usize = 64;
  pub const MAX_DESC_LEN: usize = 512;
  pub const MAX_LINK_LEN: usize = 128;
  pub const MAX_OPTIONS: usize = 8;
  pub const MAX_OPTION_LEN: usize = 64;
  pub const MAX_SIGNERS: usize = 10;

  /// DAO configuration — the root account for each DAO
  #[account]
  #[derive(Default)]
  pub struct DaoConfig {
      /// DAO creator / admin
      pub authority: Pubkey,
      /// The $FORGE governance token mint
      pub governance_mint: Pubkey,
      /// DAO treasury (PDA that holds SOL & SPL tokens)
      pub treasury: Pubkey,
      /// Human-readable name
      pub name: String,
      /// Description
      pub description: String,
      /// Voting period in seconds
      pub voting_period: i64,
      /// Minimum percentage of supply that must vote (0-100)
      pub quorum_percentage: u8,
      /// Percentage of votes needed to pass (0-100)
      pub approval_threshold: u8,
      /// Minimum staked $FORGE required to create a proposal
      pub min_stake_to_propose: u64,
      /// Required number of signers for treasury transactions
      pub multisig_threshold: u8,
      /// List of authorized multi-sig signers
      pub signers: Vec<Pubkey>,
      /// Total proposals created
      pub proposal_count: u64,
      /// Total $FORGE staked in this DAO
      pub total_staked: u64,
      /// Bump seed for PDA
      pub bump: u8,
  }

  impl DaoConfig {
      pub const SPACE: usize = 8
          + 32 + 32 + 32          // authority, governance_mint, treasury
          + 4 + MAX_NAME_LEN      // name
          + 4 + MAX_DESC_LEN      // description
          + 8 + 1 + 1 + 8 + 1    // voting_period, quorum, threshold, min_stake, multisig_threshold
          + 4 + (MAX_SIGNERS * 32) // signers vec
          + 8 + 8 + 1;            // proposal_count, total_staked, bump
  }

  /// Proposal — created by a staked DAO member
  #[account]
  pub struct Proposal {
      /// Parent DAO
      pub dao: Pubkey,
      /// Proposal creator
      pub proposer: Pubkey,
      /// Sequential ID within the DAO
      pub id: u64,
      pub title: String,
      pub description: String,
      /// External link (forum post, IPFS, etc.)
      pub link: String,
      /// Voting options (e.g., ["Yes", "No", "Abstain"])
      pub options: Vec<String>,
      /// Vote tallies (parallel to options)
      pub vote_counts: Vec<u64>,
      /// Unix timestamp when voting starts
      pub created_at: i64,
      /// Unix timestamp when voting ends
      pub voting_ends_at: i64,
      /// Current status
      pub status: ProposalStatus,
      /// Total votes cast
      pub total_votes: u64,
      /// Winning option index (set on finalization)
      pub winning_option: Option<u8>,
      pub bump: u8,
  }

  impl Proposal {
      pub const SPACE: usize = 8
          + 32 + 32 + 8           // dao, proposer, id
          + 4 + MAX_NAME_LEN      // title (using MAX_NAME_LEN as proxy)
          + 4 + MAX_DESC_LEN      // description
          + 4 + MAX_LINK_LEN      // link
          + 4 + (MAX_OPTIONS * (4 + MAX_OPTION_LEN)) // options vec
          + 4 + (MAX_OPTIONS * 8) // vote_counts vec
          + 8 + 8 + 1 + 8 + 2 + 1; // timestamps, status, total_votes, winning_option, bump
  }

  #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Default)]
  pub enum ProposalStatus {
      #[default]
      Active,
      Passed,
      Failed,
      Cancelled,
      Executed,
  }

  /// Vote record — prevents double voting
  #[account]
  pub struct VoteRecord {
      pub proposal: Pubkey,
      pub voter: Pubkey,
      pub option_index: u8,
      /// Voting power used (staked $FORGE at time of vote)
      pub voting_power: u64,
      pub timestamp: i64,
      pub bump: u8,
  }

  impl VoteRecord {
      pub const SPACE: usize = 8 + 32 + 32 + 1 + 8 + 8 + 1;
  }

  /// Stake record — tracks each user's staked $FORGE per DAO
  #[account]
  pub struct StakeRecord {
      pub dao: Pubkey,
      pub staker: Pubkey,
      pub staked_amount: u64,
      /// Number of active votes (unstake locked while > 0)
      pub active_votes: u8,
      pub staked_at: i64,
      pub bump: u8,
  }

  impl StakeRecord {
      pub const SPACE: usize = 8 + 32 + 32 + 8 + 1 + 8 + 1;
  }

  /// Multi-sig treasury transaction
  #[account]
  pub struct MultiSigTx {
      pub dao: Pubkey,
      pub proposer: Pubkey,
      pub recipient: Pubkey,
      pub amount: u64,
      pub description: String,
      /// Signers who have approved
      pub approvals: Vec<Pubkey>,
      pub executed: bool,
      pub created_at: i64,
      pub bump: u8,
  }

  impl MultiSigTx {
      pub const SPACE: usize = 8
          + 32 + 32 + 32 + 8     // dao, proposer, recipient, amount
          + 4 + MAX_DESC_LEN     // description
          + 4 + (MAX_SIGNERS * 32) // approvals
          + 1 + 8 + 1;           // executed, created_at, bump
  }
  