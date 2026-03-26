use anchor_lang::prelude::*;
  use anchor_lang::system_program;
  use crate::{errors::DaoForgeError, state::*};

  #[derive(Accounts)]
  pub struct CreateTreasuryTx<'info> {
      #[account(mut)]
      pub proposer: Signer<'info>,

      pub dao_config: Account<'info, DaoConfig>,

      #[account(
          init,
          payer = proposer,
          space = MultiSigTx::SPACE,
          seeds = [b"multisig-tx", dao_config.key().as_ref(), &dao_config.proposal_count.to_le_bytes()],
          bump
      )]
      pub multisig_tx: Account<'info, MultiSigTx>,

      pub system_program: Program<'info, System>,
      pub rent: Sysvar<'info, Rent>,
  }

  pub fn create_tx_handler(
      ctx: Context<CreateTreasuryTx>,
      amount: u64,
      recipient: Pubkey,
      description: String,
  ) -> Result<()> {
      require!(description.len() <= MAX_DESC_LEN, DaoForgeError::DescriptionTooLong);
      let dao = &ctx.accounts.dao_config;
      require!(
          dao.signers.contains(&ctx.accounts.proposer.key()),
          DaoForgeError::UnauthorizedSigner
      );

      let tx = &mut ctx.accounts.multisig_tx;
      tx.dao = dao.key();
      tx.proposer = ctx.accounts.proposer.key();
      tx.recipient = recipient;
      tx.amount = amount;
      tx.description = description;
      tx.approvals = vec![ctx.accounts.proposer.key()]; // proposer auto-approves
      tx.executed = false;
      tx.created_at = Clock::get()?.unix_timestamp;
      tx.bump = ctx.bumps.multisig_tx;

      emit!(TreasuryTxCreated {
          dao: dao.key(),
          tx: tx.key(),
          proposer: tx.proposer,
          recipient,
          amount,
      });
      Ok(())
  }

  #[derive(Accounts)]
  pub struct ApproveTreasuryTx<'info> {
      #[account(mut)]
      pub signer: Signer<'info>,

      pub dao_config: Account<'info, DaoConfig>,

      #[account(
          mut,
          constraint = multisig_tx.dao == dao_config.key()
      )]
      pub multisig_tx: Account<'info, MultiSigTx>,
  }

  pub fn approve_handler(ctx: Context<ApproveTreasuryTx>) -> Result<()> {
      let dao = &ctx.accounts.dao_config;
      let signer_key = ctx.accounts.signer.key();

      require!(dao.signers.contains(&signer_key), DaoForgeError::UnauthorizedSigner);
      let tx = &mut ctx.accounts.multisig_tx;
      require!(!tx.executed, DaoForgeError::TxAlreadyExecuted);
      require!(!tx.approvals.contains(&signer_key), DaoForgeError::AlreadyApproved);

      tx.approvals.push(signer_key);
      emit!(TreasuryTxApproved { tx: tx.key(), signer: signer_key, total_approvals: tx.approvals.len() as u8 });
      Ok(())
  }

  #[derive(Accounts)]
  pub struct ExecuteTreasuryTx<'info> {
      #[account(mut)]
      pub executor: Signer<'info>,

      pub dao_config: Account<'info, DaoConfig>,

      #[account(
          mut,
          seeds = [b"treasury", dao_config.key().as_ref()],
          bump
      )]
      /// CHECK: Treasury PDA
      pub treasury: UncheckedAccount<'info>,

      #[account(
          mut,
          constraint = multisig_tx.dao == dao_config.key()
      )]
      pub multisig_tx: Account<'info, MultiSigTx>,

      /// CHECK: Recipient of the funds
      #[account(mut, constraint = recipient.key() == multisig_tx.recipient)]
      pub recipient: UncheckedAccount<'info>,

      pub system_program: Program<'info, System>,
  }

  pub fn execute_handler(ctx: Context<ExecuteTreasuryTx>) -> Result<()> {
      let dao = &ctx.accounts.dao_config;
      let tx = &mut ctx.accounts.multisig_tx;
      require!(!tx.executed, DaoForgeError::TxAlreadyExecuted);
      require!(
          tx.approvals.len() as u8 >= dao.multisig_threshold,
          DaoForgeError::InsufficientApprovals
      );

      // Transfer SOL from treasury PDA to recipient
      let treasury_bump = ctx.bumps.treasury;
      let dao_key = dao.key();
      let seeds = &[b"treasury" as &[u8], dao_key.as_ref(), &[treasury_bump]];
      let signer = &[&seeds[..]];

      system_program::transfer(
          CpiContext::new_with_signer(
              ctx.accounts.system_program.to_account_info(),
              system_program::Transfer {
                  from: ctx.accounts.treasury.to_account_info(),
                  to: ctx.accounts.recipient.to_account_info(),
              },
              signer,
          ),
          tx.amount,
      )?;

      tx.executed = true;
      emit!(TreasuryTxExecuted { tx: tx.key(), recipient: tx.recipient, amount: tx.amount });
      Ok(())
  }

  #[event] pub struct TreasuryTxCreated { pub dao: Pubkey, pub tx: Pubkey, pub proposer: Pubkey, pub recipient: Pubkey, pub amount: u64 }
  #[event] pub struct TreasuryTxApproved { pub tx: Pubkey, pub signer: Pubkey, pub total_approvals: u8 }
  #[event] pub struct TreasuryTxExecuted { pub tx: Pubkey, pub recipient: Pubkey, pub amount: u64 }
  