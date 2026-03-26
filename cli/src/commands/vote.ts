import { Command } from "commander";
  import chalk from "chalk";
  import ora from "ora";
  import { loadWallet } from "../utils/wallet.js";

  export const voteCommand = new Command("vote")
    .description("Vote on a governance proposal");

  voteCommand
    .command("cast")
    .description("Cast your vote on an active proposal")
    .requiredOption("--proposal <address>", "Proposal address")
    .requiredOption("--option <index>", "Option index to vote for (0-based)", parseInt)
    .action(async (opts) => {
      const spinner = ora("Casting vote...").start();
      try {
        const wallet = loadWallet();
        console.log(chalk.cyan(`Voter:    ${wallet.publicKey.toString()}`));
        console.log(chalk.cyan(`Proposal: ${opts.proposal}`));
        console.log(chalk.cyan(`Option:   ${opts.option}`));
        spinner.succeed(chalk.green("Vote ready. Connect to deployed program to submit."));
      } catch (err: any) {
        spinner.fail(chalk.red(err.message));
      }
    });
  