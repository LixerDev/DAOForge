use anchor_lang::prelude::*;
  use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
  use crate::{errors::DaoForgeError, state::*};

  #[derive(Accounts)]
  pub struct StakeTokens<'info> {
      #[account(mut)]
      pub staker: Signer<'info>,

      #[account(mut)]
      pub dao_config: Account<'info, DaoConfig>,

      /// Source: staker's wallet token account
      #[account(
          mut,
          token::mint = dao_config.governance_mint,
          token::authority = staker
      )]
      pub staker_token_account: Account<'info, TokenAccount>,

      /// Destination: DAO staking vault
      #[account(
          mut,
          seeds = [b"stake-vault", dao_config.key().as_ref()],
          bump,
          token::mint = dao_config.governance_mint,
          token::authority = dao_config
      )]
      pub stake_vault: Account<'info, TokenAccount>,

      /// Per-user stake record (created if first time)
      #[account(
          init_if_needed,
          payer = staker,
          space = StakeRecord::SPACE,
          seeds = [b"stake", dao_config.key().as_ref(), staker.key().as_ref()],
          bump
      )]
      pub stake_record: Account<'info, StakeRecord>,

      pub token_program: Program<'info, Token>,
      pub system_program: Program<'info, System>,
      pub rent: Sysvar<'info, Rent>,
  }

  pub fn stake_handler(ctx: Context<StakeTokens>, amount: u64) -> Result<()> {
      require!(amount > 0, DaoForgeError::InsufficientStake);

      // Transfer tokens from staker to vault
      token::transfer(
          CpiContext::new(
              ctx.accounts.token_program.to_account_info(),
              Transfer {
                  from: ctx.accounts.staker_token_account.to_account_info(),
                  to: ctx.accounts.stake_vault.to_account_info(),
                  authority: ctx.accounts.staker.to_account_info(),
              },
          ),
          amount,
      )?;

      let record = &mut ctx.accounts.stake_record;
      record.dao = ctx.accounts.dao_config.key();
      record.staker = ctx.accounts.staker.key();
      record.staked_amount = record.staked_amount.checked_add(amount).ok_or(DaoForgeError::MathOverflow)?;
      if record.staked_at == 0 { record.staked_at = Clock::get()?.unix_timestamp; }
      record.bump = ctx.bumps.stake_record;

      let dao = &mut ctx.accounts.dao_config;
      dao.total_staked = dao.total_staked.checked_add(amount).ok_or(DaoForgeError::MathOverflow)?;

      emit!(TokensStaked {
          dao: dao.key(),
          staker: ctx.accounts.staker.key(),
          amount,
          new_total: record.staked_amount,
      });
      Ok(())
  }

  #[derive(Accounts)]
  pub struct UnstakeTokens<'info> {
      #[account(mut)]
      pub staker: Signer<'info>,

      #[account(mut)]
      pub dao_config: Account<'info, DaoConfig>,

      #[account(
          mut,
          token::mint = dao_config.governance_mint,
          token::authority = staker
      )]
      pub staker_token_account: Account<'info, TokenAccount>,

      #[account(
          mut,
          seeds = [b"stake-vault", dao_config.key().as_ref()],
          bump,
          token::mint = dao_config.governance_mint,
          token::authority = dao_config
      )]
      pub stake_vault: Account<'info, TokenAccount>,

      #[account(
          mut,
          seeds = [b"stake", dao_config.key().as_ref(), staker.key().as_ref()],
          bump = stake_record.bump
      )]
      pub stake_record: Account<'info, StakeRecord>,

      pub token_program: Program<'info, Token>,
      pub system_program: Program<'info, System>,
  }

  pub fn unstake_handler(ctx: Context<UnstakeTokens>, amount: u64) -> Result<()> {
      let record = &ctx.accounts.stake_record;
      require!(record.active_votes == 0, DaoForgeError::StakeLocked);
      require!(record.staked_amount >= amount, DaoForgeError::InsufficientStakedBalance);

      let dao_key = ctx.accounts.dao_config.key();
      let bump = ctx.accounts.dao_config.bump;
      let seeds = &[b"dao" as &[u8], &[bump]];
      let signer = &[&seeds[..]];

      token::transfer(
          CpiContext::new_with_signer(
              ctx.accounts.token_program.to_account_info(),
              Transfer {
                  from: ctx.accounts.stake_vault.to_account_info(),
                  to: ctx.accounts.staker_token_account.to_account_info(),
                  authority: ctx.accounts.dao_config.to_account_info(),
              },
              signer,
          ),
          amount,
      )?;

      let record = &mut ctx.accounts.stake_record;
      record.staked_amount -= amount;

      let dao = &mut ctx.accounts.dao_config;
      dao.total_staked = dao.total_staked.saturating_sub(amount);

      emit!(TokensUnstaked { dao: dao_key, staker: ctx.accounts.staker.key(), amount });
      Ok(())
  }

  #[event] pub struct TokensStaked { pub dao: Pubkey, pub staker: Pubkey, pub amount: u64, pub new_total: u64 }
  #[event] pub struct TokensUnstaked { pub dao: Pubkey, pub staker: Pubkey, pub amount: u64 }
  