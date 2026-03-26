import { Command } from "commander";
  import chalk from "chalk";
  import ora from "ora";
  import { getConnection } from "../utils/connection.js";
  import { loadWallet } from "../utils/wallet.js";

  export const proposalCommand = new Command("proposal")
    .description("Create and manage governance proposals");

  proposalCommand
    .command("create")
    .description("Create a new governance proposal")
    .requiredOption("--dao <address>", "DAO address")
    .requiredOption("--title <title>", "Proposal title")
    .requiredOption("--description <desc>", "Proposal description")
    .option("--option <value>", "Voting option (can be repeated)", (v, acc: string[]) => [...acc, v], [] as string[])
    .option("--link <url>", "Forum/IPFS link for full details", "")
    .action(async (opts) => {
      const spinner = ora("Creating proposal...").start();
      try {
        const wallet = loadWallet();
        const options = opts.option.length >= 2 ? opts.option : ["Yes", "No"];
        spinner.text = `Proposer: ${wallet.publicKey.toString()}`;
        console.log(chalk.cyan("\nProposal:"), opts.title);
        console.log(chalk.gray("Options:"), options.join(" | "));
        spinner.succeed(chalk.green("Proposal ready. Connect to deployed program to submit."));
      } catch (err: any) {
        spinner.fail(chalk.red(err.message));
      }
    });

  proposalCommand
    .command("list")
    .description("List all proposals for a DAO")
    .requiredOption("--dao <address>", "DAO address")
    .action(async (opts) => {
      const connection = getConnection();
      console.log(chalk.cyan(`Fetching proposals for DAO: ${opts.dao}`));
      console.log(chalk.yellow("Deploy program to fetch live proposals."));
    });
  