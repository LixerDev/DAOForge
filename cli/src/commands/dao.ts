import { Command } from "commander";
  import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
  import * as anchor from "@coral-xyz/anchor";
  import chalk from "chalk";
  import ora from "ora";
  import { getConnection, PROGRAM_ID } from "../utils/connection.js";
  import { loadWallet } from "../utils/wallet.js";

  export const daoCommand = new Command("dao")
    .description("Manage DAOs");

  daoCommand
    .command("create")
    .description("Create a new DAO with $FORGE governance token")
    .requiredOption("--name <name>", "DAO name (max 64 chars)")
    .option("--description <desc>", "DAO description", "A DAOForge governance DAO")
    .option("--quorum <pct>", "Quorum percentage (1-100)", "20")
    .option("--threshold <pct>", "Approval threshold percentage (1-100)", "60")
    .option("--period <seconds>", "Voting period in seconds", "604800")
    .option("--min-stake <amount>", "Min staked $FORGE to propose (in tokens)", "1000")
    .option("--multisig-threshold <n>", "Multi-sig signers required", "2")
    .action(async (opts) => {
      const spinner = ora("Creating DAO...").start();
      try {
        const connection = getConnection();
        const wallet = loadWallet();
        spinner.text = `Creating DAO "${opts.name}" on ${connection.rpcEndpoint}`;

        // ⚠️ Replace with actual Anchor program call once IDL is generated
        console.log(chalk.yellow("\nDAO Creation Parameters:"));
        console.log(`  Name:              ${chalk.cyan(opts.name)}`);
        console.log(`  Quorum:            ${chalk.cyan(opts.quorum + "%")}`);
        console.log(`  Threshold:         ${chalk.cyan(opts.threshold + "%")}`);
        console.log(`  Voting Period:     ${chalk.cyan(opts.period + "s")}`);
        console.log(`  Min Stake:         ${chalk.cyan(opts.minStake + " $FORGE")}`);
        console.log(`  Multi-sig Thresh:  ${chalk.cyan(opts.multisigThreshold)}`);
        console.log(`  Authority:         ${chalk.cyan(wallet.publicKey.toString())}`);

        spinner.succeed(chalk.green("DAO parameters ready. Deploy program and run again to create on-chain."));
      } catch (err: any) {
        spinner.fail(chalk.red("Failed: " + err.message));
        process.exit(1);
      }
    });

  daoCommand
    .command("list")
    .description("List all DAOs on-chain")
    .action(async () => {
      const spinner = ora("Fetching DAOs...").start();
      try {
        const connection = getConnection();
        spinner.succeed(chalk.green(`Connected to ${connection.rpcEndpoint}`));
        console.log(chalk.yellow("Deploy program to list DAOs on-chain."));
      } catch (err: any) {
        spinner.fail(chalk.red(err.message));
      }
    });
  