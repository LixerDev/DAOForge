# 🏛️ DAOForge

  **Create and manage DAOs on Solana** — proposals, token voting, multi-sig treasury. All from CLI or web.

  ![License](https://img.shields.io/badge/license-MIT-blue.svg)
  ![Solana](https://img.shields.io/badge/Solana-Program-purple.svg)
  ![Anchor](https://img.shields.io/badge/Anchor-0.30-green.svg)

  ---

  ## ✨ Overview

  DAOForge is a full-stack DAO framework built on **Solana** using the **Anchor** framework. It introduces the **`$FORGE`** governance token, enabling communities to:

  - 🏗️ **Create DAOs** with custom rules, quorum thresholds, and voting periods
  - 📋 **Submit Proposals** with text, links, and multiple options
  - 🗳️ **Vote on-chain** with voting power proportional to staked `$FORGE`
  - 🔐 **Multi-sig Treasury** requiring M-of-N signer approvals for fund movements
  - 💰 **Token Economy** — stake `$FORGE` to earn governance weight and rewards
  - 🖥️ **CLI** — full terminal-based DAO management
  - 🌐 **Web App** — Next.js dashboard for visual governance

  ---

  ## 🪙 `$FORGE` Token Economy

  | Parameter | Value |
  |-----------|-------|
  | Symbol | `$FORGE` |
  | Decimals | 6 |
  | Initial Supply | 1,000,000,000 |
  | Staking Required | Yes (for proposal creation and voting) |
  | Min to Propose | Configurable per DAO |
  | Voting Power | 1 staked `$FORGE` = 1 vote |

  **Token Flow:**
  ```
  Mint $FORGE → Stake in DAO → Earn Voting Power → Vote / Propose → Rewards
  ```

  ---

  ## 🗂️ Repository Structure

  ```
  DAOForge/
  ├── programs/
  │   └── dao-forge/          # Anchor on-chain program (Rust)
  │       └── src/
  │           ├── lib.rs        # Program entry + instruction routing
  │           ├── state.rs      # Account structures (DAO, Proposal, Vote, Stake)
  │           ├── errors.rs     # Custom error codes
  │           └── instructions/ # One file per instruction
  ├── cli/                    # TypeScript CLI (daoforge)
  │   └── src/commands/       # create-dao, propose, vote, treasury, token
  ├── app/                    # Next.js web interface
  │   └── src/
  │       ├── pages/          # Home, DAO detail, Proposal detail
  │       ├── components/     # DAOCard, ProposalCard, VotePanel, Treasury
  │       └── hooks/          # useDAO, useProposals, useToken
  ├── tests/                  # Anchor TypeScript tests
  ├── Anchor.toml
  └── Cargo.toml
  ```

  ---

  ## ⚡ Quick Start

  ### Prerequisites

  - [Rust](https://rustup.rs/) + `cargo`
  - [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) ≥ 1.18
  - [Anchor CLI](https://www.anchor-lang.com/docs/installation) ≥ 0.30
  - [Node.js](https://nodejs.org/) ≥ 18

  ### 1. Clone & Install

  ```bash
  git clone https://github.com/LixerDev/DAOForge.git
  cd DAOForge
  npm install
  ```

  ### 2. Build the Program

  ```bash
  anchor build
  ```

  ### 3. Deploy to Devnet

  ```bash
  anchor deploy --provider.cluster devnet
  ```

  ### 4. Run Tests

  ```bash
  anchor test
  ```

  ---

  ## 🖥️ CLI Usage

  ```bash
  cd cli && npm install && npm run build

  # Create a DAO
  daoforge dao create --name "MyDAO" --quorum 20 --threshold 60 --period 7d

  # Mint $FORGE tokens
  daoforge token mint --amount 10000

  # Stake for voting power
  daoforge token stake --amount 5000

  # Create a proposal
  daoforge proposal create --title "Fund Marketing" --description "Allocate 50 SOL for marketing" --option "Yes" --option "No"

  # Vote
  daoforge vote --proposal <PROPOSAL_ADDRESS> --option 0

  # Treasury multi-sig
  daoforge treasury propose --amount 10 --to <RECIPIENT> --description "Dev fund"
  daoforge treasury approve --tx <TX_ADDRESS>
  daoforge treasury execute --tx <TX_ADDRESS>
  ```

  ---

  ## 🌐 Web App

  ```bash
  cd app && npm install && npm run dev
  # Open http://localhost:3000
  ```

  Connect your Phantom/Solflare wallet and interact with all DAOs on the network.

  ---

  ## 🔐 Program Accounts

  | Account | Description |
  |---------|-------------|
  | `DaoConfig` | DAO metadata, rules, treasury key |
  | `Proposal` | Title, options, vote tallies, status |
  | `VoteRecord` | Prevents double-voting per user per proposal |
  | `StakeRecord` | User's staked `$FORGE` amount and DAO |
  | `MultiSigTx` | Treasury transaction awaiting approvals |

  ---

  ## 🛡️ Security

  - All state transitions validated by Anchor constraints
  - Vote records prevent double-voting
  - Stake lockup during active proposals
  - Multi-sig threshold enforced on-chain
  - All accounts use PDAs for deterministic addressing

  ---

  ## 📄 License

  MIT — see [LICENSE](./LICENSE)

  ---

  *Built with ❤️ using Anchor + Solana*
  