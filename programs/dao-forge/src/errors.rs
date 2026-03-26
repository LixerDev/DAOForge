use anchor_lang::prelude::*;

  #[error_code]
  pub enum DaoForgeError {
      #[msg("DAO name is too long (max 64 chars)")]
      NameTooLong,

      #[msg("Description is too long (max 512 chars)")]
      DescriptionTooLong,

      #[msg("Quorum percentage must be between 1 and 100")]
      InvalidQuorum,

      #[msg("Approval threshold must be between 1 and 100")]
      InvalidThreshold,

      #[msg("Voting period must be at least 1 hour")]
      VotingPeriodTooShort,

      #[msg("Insufficient staked $FORGE to create a proposal")]
      InsufficientStake,

      #[msg("Cannot unstake while you have active votes")]
      StakeLocked,

      #[msg("Voting period has not ended yet")]
      VotingNotEnded,

      #[msg("Voting period has already ended")]
      VotingEnded,

      #[msg("Proposal is not in active status")]
      ProposalNotActive,

      #[msg("Proposal has already been finalized")]
      AlreadyFinalized,

      #[msg("You have already voted on this proposal")]
      AlreadyVoted,

      #[msg("Invalid vote option index")]
      InvalidOption,

      #[msg("Too many options (max 8)")]
      TooManyOptions,

      #[msg("Treasury transaction has already been executed")]
      TxAlreadyExecuted,

      #[msg("Not enough approvals to execute treasury transaction")]
      InsufficientApprovals,

      #[msg("Signer is not authorized for this DAO treasury")]
      UnauthorizedSigner,

      #[msg("You have already approved this treasury transaction")]
      AlreadyApproved,

      #[msg("Multi-sig threshold must be between 1 and the number of signers")]
      InvalidMultisigThreshold,

      #[msg("Too many signers (max 10)")]
      TooManySigners,

      #[msg("Cannot unstake more than currently staked")]
      InsufficientStakedBalance,

      #[msg("Arithmetic overflow")]
      MathOverflow,
  }
  