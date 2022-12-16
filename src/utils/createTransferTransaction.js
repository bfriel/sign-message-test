import { Transaction, SystemProgram } from "@solana/web3.js";

const createTransferTransaction = async (publicKey, connection) => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: publicKey,
      lamports: 100,
    })
  );
  transaction.feePayer = publicKey;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  return transaction;
};

export default createTransferTransaction;
