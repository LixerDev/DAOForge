import { Command } from "commander";
  import chalk from "chalk";
  import ora from "ora";
  import { loadWallet } from "../utils/wallet.js";

  export const tokenCommand = new Command("token")
    .description("$FORGE token management");

  tokenCommand
    .command("balance")
    .description("Show your $FORGE balance")
    .requiredOption("--dao <address>", "DAO address (to determine the correct $FORGE mint)")
    .action(async (opts) => {
      const wallet = loadWallet();
      console.log(chalk.cyan(`Wallet: ${wallet.publicKey.toString()}`));
      console.log(chalk.yellow("Connect to deployed program to fetch live balance."));
    });

  tokenCommand
    .command("stake")
    .description("Stake $FORGE tokens for voting power")
    .requiredOption("--dao <address>", "DAO address")
    .requiredOption("--amount <tokens>", "Amount of $FORGE to stake", parseFloat)
    .action(async (opts) => {
      const wallet = loadWallet();
      const spinner = ora(`Staking ${opts.amount} $FORGE...`).start();
      console.log(chalk.cyan(`Staker: ${wallet.publicKey.toString()}`));
      spinner.succeed(chalk.green("Stake ready. Connect to deployed program to submit."));
    });

  tokenCommand
    .command("unstake")
    .description("Unstake $FORGE tokens")
    .requiredOption("--dao <address>", "DAO address")
    .requiredOption("--amount <tokens>", "Amount to unstake", parseFloat)
    .action(async (opts) => {
      const wallet = loadWallet();
      const spinner = ora(`Unstaking ${opts.amount} $FORGE...`).start();
      console.log(chalk.cyan(`Wallet: ${wallet.publicKey.toString()}`));
      spinner.succeed(chalk.green("Unstake ready. Connect to deployed program to submit."));
    });
  