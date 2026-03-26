#!/usr/bin/env node
  import { Command } from "commander";
  import chalk from "chalk";
  import { daoCommand } from "./commands/dao.js";
  import { proposalCommand } from "./commands/proposal.js";
  import { voteCommand } from "./commands/vote.js";
  import { treasuryCommand } from "./commands/treasury.js";
  import { tokenCommand } from "./commands/token.js";

  const program = new Command();

  program
    .name("daoforge")
    .description(
      chalk.bold.cyan("🏛️  DAOForge") +
      " — Create and manage DAOs on Solana\n" +
      chalk.gray("   Proposals • Token Voting • Multi-sig Treasury")
    )
    .version("0.1.0");

  program.addCommand(daoCommand);
  program.addCommand(proposalCommand);
  program.addCommand(voteCommand);
  program.addCommand(treasuryCommand);
  program.addCommand(tokenCommand);

  program.parse(process.argv);
  