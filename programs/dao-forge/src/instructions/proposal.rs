use anchor_lang::prelude::*;
  use crate::{errors::DaoForgeError, state::*};

  #[derive(Accounts)]
  #[instruction(title: String)]
  pub struct CreateProposal<'info> {
      #[account(mut)]
      pub proposer: Signer<'info>,

      #[account(mut)]
      pub dao_config: Account<'info, DaoConfig>,

      #[account(
          seeds = [b"stake", dao_config.key().as_ref(), proposer.key().as_ref()],
          bump = stake_record.bump
      )]
      pub stake_record: Account<'info, StakeRecord>,

      #[account(
          init,
          payer = proposer,
          space = Proposal::SPACE,
          seeds = [b"proposal", dao_config.key().as_ref(), dao_config.proposal_count.to_le_bytes().as_ref()],
          bump
      )]
      pub proposal: Account<'info, Proposal>,

      pub system_program: Program<'info, System>,
      pub rent: Sysvar<'info, Rent>,
  }

  pub fn create_handler(
      ctx: Context<CreateProposal>,
      title: String,
      description: String,
      options: Vec<String>,
      link: String,
  ) -> Result<()> {
      require!(title.len() <= MAX_NAME_LEN, DaoForgeError::NameTooLong);
      require!(description.len() <= MAX_DESC_LEN, DaoForgeError::DescriptionTooLong);
      require!(options.len() >= 2 && options.len() <= MAX_OPTIONS, DaoForgeError::TooManyOptions);
      require!(
          ctx.accounts.stake_record.staked_amount >= ctx.accounts.dao_config.min_stake_to_propose,
          DaoForgeError::InsufficientStake
      );

      let dao = &mut ctx.accounts.dao_config;
      let now = Clock::get()?.unix_timestamp;
      let proposal = &mut ctx.accounts.proposal;

      proposal.dao = dao.key();
      proposal.proposer = ctx.accounts.proposer.key();
      proposal.id = dao.proposal_count;
      proposal.title = title;
      proposal.description = description;
      proposal.link = link;
      proposal.vote_counts = vec![0u64; options.len()];
      proposal.options = options;
      proposal.created_at = now;
      proposal.voting_ends_at = now + dao.voting_period;
      proposal.status = ProposalStatus::Active;
      proposal.total_votes = 0;
      proposal.winning_option = None;
      proposal.bump = ctx.bumps.proposal;

      dao.proposal_count += 1;

      emit!(ProposalCreated {
          dao: dao.key(),
          proposal: proposal.key(),
          proposer: ctx.accounts.proposer.key(),
          id: proposal.id,
          title: proposal.title.clone(),
          voting_ends_at: proposal.voting_ends_at,
      });
      Ok(())
  }

  #[derive(Accounts)]
  pub struct FinalizeProposal<'info> {
      #[account(mut)]
      pub dao_config: Account<'info, DaoConfig>,

      #[account(
          mut,
          constraint = proposal.dao == dao_config.key()
      )]
      pub proposal: Account<'info, Proposal>,
  }

  pub fn finalize_handler(ctx: Context<FinalizeProposal>) -> Result<()> {
      let now = Clock::get()?.unix_timestamp;
      let proposal = &mut ctx.accounts.proposal;
      let dao = &ctx.accounts.dao_config;

      require!(proposal.status == ProposalStatus::Active, DaoForgeError::ProposalNotActive);
      require!(now > proposal.voting_ends_at, DaoForgeError::VotingNotEnded);

      // Check quorum: total votes / total staked must exceed quorum %
      let quorum_met = if dao.total_staked > 0 {
          proposal.total_votes * 100 / dao.total_staked >= dao.quorum_percentage as u64
      } else { false };

      if !quorum_met {
          proposal.status = ProposalStatus::Failed;
          emit!(ProposalFinalized { proposal: proposal.key(), status: 2, winning_option: None });
          return Ok(());
      }

      // Find winning option
      let max_votes = *proposal.vote_counts.iter().max().unwrap_or(&0);
      let winning_idx = proposal.vote_counts.iter().position(|&v| v == max_votes).unwrap_or(0) as u8;

      // Check approval threshold
      let passed = if proposal.total_votes > 0 {
          max_votes * 100 / proposal.total_votes >= dao.approval_threshold as u64
      } else { false };

      proposal.winning_option = Some(winning_idx);
      proposal.status = if passed { ProposalStatus::Passed } else { ProposalStatus::Failed };

      emit!(ProposalFinalized {
          proposal: proposal.key(),
          status: if passed { 1 } else { 2 },
          winning_option: proposal.winning_option,
      });
      Ok(())
  }

  #[event] pub struct ProposalCreated { pub dao: Pubkey, pub proposal: Pubkey, pub proposer: Pubkey, pub id: u64, pub title: String, pub voting_ends_at: i64 }
  #[event] pub struct ProposalFinalized { pub proposal: Pubkey, pub status: u8, pub winning_option: Option<u8> }
  