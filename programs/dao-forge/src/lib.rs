use anchor_lang::prelude::*;

  pub mod errors;
  pub mod instructions;
  pub mod state;

  use instructions::{
      create_dao::*, proposal::*, stake::*, treasury::*, vote::*,
  };

  declare_id!("DAoFRGExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

  #[program]
  pub mod dao_forge {
      use super::*;

      /// Initialize a new DAO with custom governance rules and a $FORGE token
      pub fn create_dao(
          ctx: Context<CreateDao>,
          name: String,
          description: String,
          voting_period: i64,
          quorum_percentage: u8,
          approval_threshold: u8,
          min_stake_to_propose: u64,
          multisig_threshold: u8,
      ) -> Result<()> {
          instructions::create_dao::handler(
              ctx, name, description, voting_period, quorum_percentage,
              approval_threshold, min_stake_to_propose, multisig_threshold,
          )
      }

      /// Stake $FORGE tokens to gain voting power
      pub fn stake_tokens(ctx: Context<StakeTokens>, amount: u64) -> Result<()> {
          instructions::stake::stake_handler(ctx, amount)
      }

      /// Unstake $FORGE tokens (only if no active votes)
      pub fn unstake_tokens(ctx: Context<UnstakeTokens>, amount: u64) -> Result<()> {
          instructions::stake::unstake_handler(ctx, amount)
      }

      /// Create a governance proposal
      pub fn create_proposal(
          ctx: Context<CreateProposal>,
          title: String,
          description: String,
          options: Vec<String>,
          link: String,
      ) -> Result<()> {
          instructions::proposal::create_handler(ctx, title, description, options, link)
      }

      /// Cast a vote on a proposal (1 staked $FORGE = 1 vote)
      pub fn cast_vote(ctx: Context<CastVote>, option_index: u8) -> Result<()> {
          instructions::vote::handler(ctx, option_index)
      }

      /// Finalize proposal after voting period ends
      pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
          instructions::proposal::finalize_handler(ctx)
      }

      /// Propose a treasury transaction (multi-sig)
      pub fn create_treasury_tx(
          ctx: Context<CreateTreasuryTx>,
          amount: u64,
          recipient: Pubkey,
          description: String,
      ) -> Result<()> {
          instructions::treasury::create_tx_handler(ctx, amount, recipient, description)
      }

      /// Approve a pending treasury transaction
      pub fn approve_treasury_tx(ctx: Context<ApproveTreasuryTx>) -> Result<()> {
          instructions::treasury::approve_handler(ctx)
      }

      /// Execute a treasury transaction once threshold is reached
      pub fn execute_treasury_tx(ctx: Context<ExecuteTreasuryTx>) -> Result<()> {
          instructions::treasury::execute_handler(ctx)
      }
  }
  