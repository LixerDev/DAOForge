use anchor_lang::prelude::*;
  use crate::{errors::DaoForgeError, state::*};

  #[derive(Accounts)]
  pub struct CastVote<'info> {
      #[account(mut)]
      pub voter: Signer<'info>,

      pub dao_config: Account<'info, DaoConfig>,

      #[account(
          mut,
          constraint = proposal.dao == dao_config.key(),
          constraint = proposal.status == ProposalStatus::Active @ DaoForgeError::ProposalNotActive
      )]
      pub proposal: Account<'info, Proposal>,

      #[account(
          mut,
          seeds = [b"stake", dao_config.key().as_ref(), voter.key().as_ref()],
          bump = stake_record.bump
      )]
      pub stake_record: Account<'info, StakeRecord>,

      /// VoteRecord prevents double voting (init fails if already exists)
      #[account(
          init,
          payer = voter,
          space = VoteRecord::SPACE,
          seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
          bump
      )]
      pub vote_record: Account<'info, VoteRecord>,

      pub system_program: Program<'info, System>,
      pub rent: Sysvar<'info, Rent>,
  }

  pub fn handler(ctx: Context<CastVote>, option_index: u8) -> Result<()> {
      let now = Clock::get()?.unix_timestamp;
      let proposal = &mut ctx.accounts.proposal;
      let stake = &mut ctx.accounts.stake_record;

      require!(now <= proposal.voting_ends_at, DaoForgeError::VotingEnded);
      require!((option_index as usize) < proposal.options.len(), DaoForgeError::InvalidOption);
      require!(stake.staked_amount > 0, DaoForgeError::InsufficientStake);

      let voting_power = stake.staked_amount;

      // Record vote
      let record = &mut ctx.accounts.vote_record;
      record.proposal = proposal.key();
      record.voter = ctx.accounts.voter.key();
      record.option_index = option_index;
      record.voting_power = voting_power;
      record.timestamp = now;
      record.bump = ctx.bumps.vote_record;

      // Update proposal tallies
      proposal.vote_counts[option_index as usize] = proposal.vote_counts[option_index as usize]
          .checked_add(voting_power).ok_or(DaoForgeError::MathOverflow)?;
      proposal.total_votes = proposal.total_votes
          .checked_add(voting_power).ok_or(DaoForgeError::MathOverflow)?;

      // Lock staker while vote is active
      stake.active_votes += 1;

      emit!(VoteCast {
          proposal: proposal.key(),
          voter: ctx.accounts.voter.key(),
          option_index,
          voting_power,
      });
      Ok(())
  }

  #[event] pub struct VoteCast { pub proposal: Pubkey, pub voter: Pubkey, pub option_index: u8, pub voting_power: u64 }
  