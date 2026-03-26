use anchor_lang::prelude::*;
  use anchor_spl::{
      associated_token::AssociatedToken,
      token::{Mint, Token, TokenAccount},
  };

  use crate::{errors::DaoForgeError, state::*};

  #[derive(Accounts)]
  #[instruction(name: String)]
  pub struct CreateDao<'info> {
      #[account(mut)]
      pub authority: Signer<'info>,

      /// The $FORGE governance token mint (created here)
      #[account(
          init,
          payer = authority,
          mint::decimals = 6,
          mint::authority = dao_config,
          seeds = [b"forge-mint", dao_config.key().as_ref()],
          bump
      )]
      pub governance_mint: Account<'info, Mint>,

      /// DAO configuration PDA
      #[account(
          init,
          payer = authority,
          space = DaoConfig::SPACE,
          seeds = [b"dao", authority.key().as_ref(), name.as_bytes()],
          bump
      )]
      pub dao_config: Account<'info, DaoConfig>,

      /// Treasury PDA (holds SOL)
      #[account(
          seeds = [b"treasury", dao_config.key().as_ref()],
          bump
      )]
      /// CHECK: Treasury is a PDA used as a SOL vault
      pub treasury: UncheckedAccount<'info>,

      /// Authority's $FORGE token account (receives initial allocation)
      #[account(
          init_if_needed,
          payer = authority,
          associated_token::mint = governance_mint,
          associated_token::authority = authority
      )]
      pub authority_token_account: Account<'info, TokenAccount>,

      pub token_program: Program<'info, Token>,
      pub associated_token_program: Program<'info, AssociatedToken>,
      pub system_program: Program<'info, System>,
      pub rent: Sysvar<'info, Rent>,
  }

  pub fn handler(
      ctx: Context<CreateDao>,
      name: String,
      description: String,
      voting_period: i64,
      quorum_percentage: u8,
      approval_threshold: u8,
      min_stake_to_propose: u64,
      multisig_threshold: u8,
  ) -> Result<()> {
      require!(name.len() <= MAX_NAME_LEN, DaoForgeError::NameTooLong);
      require!(description.len() <= MAX_DESC_LEN, DaoForgeError::DescriptionTooLong);
      require!(quorum_percentage > 0 && quorum_percentage <= 100, DaoForgeError::InvalidQuorum);
      require!(approval_threshold > 0 && approval_threshold <= 100, DaoForgeError::InvalidThreshold);
      require!(voting_period >= 3600, DaoForgeError::VotingPeriodTooShort); // min 1 hour
      require!(multisig_threshold >= 1, DaoForgeError::InvalidMultisigThreshold);

      let dao = &mut ctx.accounts.dao_config;
      dao.authority = ctx.accounts.authority.key();
      dao.governance_mint = ctx.accounts.governance_mint.key();
      dao.treasury = ctx.accounts.treasury.key();
      dao.name = name;
      dao.description = description;
      dao.voting_period = voting_period;
      dao.quorum_percentage = quorum_percentage;
      dao.approval_threshold = approval_threshold;
      dao.min_stake_to_propose = min_stake_to_propose;
      dao.multisig_threshold = multisig_threshold;
      dao.signers = vec![ctx.accounts.authority.key()];
      dao.proposal_count = 0;
      dao.total_staked = 0;
      dao.bump = ctx.bumps.dao_config;

      // Mint initial $FORGE supply to authority (1,000,000 tokens with 6 decimals)
      let initial_supply: u64 = 1_000_000_000_000; // 1M tokens
      let dao_key = dao.key();
      let seeds = &[b"dao" as &[u8], ctx.accounts.authority.key.as_ref(), dao.name.as_bytes(), &[dao.bump]];
      let signer = &[&seeds[..]];

      anchor_spl::token::mint_to(
          CpiContext::new_with_signer(
              ctx.accounts.token_program.to_account_info(),
              anchor_spl::token::MintTo {
                  mint: ctx.accounts.governance_mint.to_account_info(),
                  to: ctx.accounts.authority_token_account.to_account_info(),
                  authority: ctx.accounts.dao_config.to_account_info(),
              },
              signer,
          ),
          initial_supply,
      )?;

      emit!(DaoCreated {
          dao: dao_key,
          authority: ctx.accounts.authority.key(),
          governance_mint: ctx.accounts.governance_mint.key(),
          name: dao.name.clone(),
      });

      Ok(())
  }

  #[event]
  pub struct DaoCreated {
      pub dao: Pubkey,
      pub authority: Pubkey,
      pub governance_mint: Pubkey,
      pub name: String,
  }
  