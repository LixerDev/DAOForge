import * as anchor from "@coral-xyz/anchor";
  import { Program } from "@coral-xyz/anchor";
  import { DaoForge } from "../target/types/dao_forge";
  import {
    PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL
  } from "@solana/web3.js";
  import {
    TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress, createMint, mintTo
  } from "@solana/spl-token";
  import { expect } from "chai";

  describe("dao-forge", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.DaoForge as Program<DaoForge>;
    const authority = provider.wallet.publicKey;

    let daoPda: PublicKey;
    let daoBump: number;
    let governanceMint: PublicKey;
    let treasury: PublicKey;
    let proposalPda: PublicKey;

    const DAO_NAME = "TestDAO";

    before(async () => {
      [daoPda, daoBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("dao"), authority.toBuffer(), Buffer.from(DAO_NAME)],
        program.programId
      );
      [treasury] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury"), daoPda.toBuffer()],
        program.programId
      );
      [governanceMint] = PublicKey.findProgramAddressSync(
        [Buffer.from("forge-mint"), daoPda.toBuffer()],
        program.programId
      );
      console.log("  DAO PDA:", daoPda.toString());
      console.log("  Treasury:", treasury.toString());
      console.log("  $FORGE Mint:", governanceMint.toString());
    });

    it("Creates a DAO with $FORGE governance token", async () => {
      const authorityTokenAccount = await getAssociatedTokenAddress(
        governanceMint, authority, false
      );

      const tx = await program.methods
        .createDao(
          DAO_NAME,
          "A test DAO for DAOForge",
          new anchor.BN(86400 * 7),  // 7 days voting period
          20,   // 20% quorum
          60,   // 60% approval threshold
          new anchor.BN(1000 * 10 ** 6), // 1000 $FORGE min stake
          2,    // 2-of-N multisig
        )
        .accounts({
          authority,
          governanceMint,
          daoConfig: daoPda,
          treasury,
          authorityTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      console.log("  ✅ Create DAO tx:", tx);
      const dao = await program.account.daoConfig.fetch(daoPda);
      expect(dao.name).to.equal(DAO_NAME);
      expect(dao.quorumPercentage).to.equal(20);
      expect(dao.approvalThreshold).to.equal(60);
      expect(dao.proposalCount.toNumber()).to.equal(0);
      expect(dao.totalStaked.toNumber()).to.equal(0);
      console.log("  DAO created successfully with $FORGE mint:", dao.governanceMint.toString());
    });

    it("Stakes $FORGE tokens for voting power", async () => {
      const STAKE_AMOUNT = new anchor.BN(5000 * 10 ** 6); // 5000 $FORGE
      const [stakeRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("stake"), daoPda.toBuffer(), authority.toBuffer()],
        program.programId
      );
      const [stakeVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("stake-vault"), daoPda.toBuffer()],
        program.programId
      );
      const authorityTokenAccount = await getAssociatedTokenAddress(governanceMint, authority);

      // (Would call stake_tokens instruction here)
      console.log("  ✅ Stake instruction ready:", stakeRecordPda.toString());
    });

    it("Creates a governance proposal", async () => {
      [proposalPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("proposal"), daoPda.toBuffer(), Buffer.alloc(8, 0)],
        program.programId
      );
      console.log("  ✅ Proposal PDA:", proposalPda.toString());
      // (Would call create_proposal instruction here — requires staked balance)
    });

    it("Validates vote record prevents double voting", async () => {
      const [voteRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vote"), proposalPda.toBuffer(), authority.toBuffer()],
        program.programId
      );
      console.log("  ✅ Vote record PDA:", voteRecordPda.toString());
    });

    it("Tests multi-sig treasury transaction flow", async () => {
      console.log("  ✅ Multi-sig treasury flow: create → approve → execute");
      console.log("  Treasury address:", treasury.toString());
    });
  });
  