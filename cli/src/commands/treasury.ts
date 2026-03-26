import { Command } from "commander";
  import chalk from "chalk";
  import ora from "ora";
  import { loadWallet } from "../utils/wallet.js";

  export const treasuryCommand = new Command("treasury")
    .description("Multi-sig treasury management");

  treasuryCommand
    .command("propose")
    .description("Propose a treasury SOL transfer")
    .requiredOption("--dao <address>", "DAO address")
    .requiredOption("--to <address>", "Recipient address")
    .requiredOption("--amount <sol>", "Amount in SOL", parseFloat)
    .requiredOption("--description <text>", "Purpose of transfer")
    .action(async (opts) => {
      const spinner = ora("Proposing treasury transaction...").start();
      const wallet = loadWallet();
      console.log(chalk.cyan(`Proposer:    ${wallet.publicKey.toString()}`));
      console.log(chalk.cyan(`To:          ${opts.to}`));
      console.log(chalk.cyan(`Amount:      ${opts.amount} SOL`));
      console.log(chalk.cyan(`Description: ${opts.description}`));
      spinner.succeed(chalk.green("Tx ready. Connect to deployed program to submit."));
    });

  treasuryCommand
    .command("approve")
    .description("Approve a pending treasury transaction")
    .requiredOption("--tx <address>", "MultiSigTx address")
    .action(async (opts) => {
      const wallet = loadWallet();
      console.log(chalk.cyan(`Approver: ${wallet.publicKey.toString()}`));
      console.log(chalk.cyan(`Tx:       ${opts.tx}`));
      console.log(chalk.green("Approve command ready. Connect to deployed program to submit."));
    });

  treasuryCommand
    .command("execute")
    .description("Execute an approved treasury transaction")
    .requiredOption("--tx <address>", "MultiSigTx address")
    .action(async (opts) => {
      const wallet = loadWallet();
      console.log(chalk.cyan(`Executor: ${wallet.publicKey.toString()}`));
      console.log(chalk.cyan(`Tx:       ${opts.tx}`));
      console.log(chalk.green("Execute command ready. Connect to deployed program to submit."));
    });
  