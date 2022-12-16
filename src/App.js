import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  ConnectionProvider,
  useConnection,
  useWallet,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, useState } from "react";
import "./App.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import createTransferTransaction from "./utils/createTransferTransaction";

const Context = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter()], // confirmed also with `() => []` for wallet-standard only
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const Content = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const [transactionVariable, setTransactionVariable] = useState({});
  const [reAssignedTransactionVariable, setReAssignedTransactionVariable] =
    useState({});

  const signDemoTransactionWithWalletAdapter = async () => {
    if (!publicKey) return;
    try {
      const transaction = await createTransferTransaction(
        publicKey,
        connection
      );
      console.log("unsigned transaction: ", transaction);
      const signedTransaction = await signTransaction(transaction);
      console.log("previously assigned transaction: ", transaction);
      setTransactionVariable(transaction);
      console.log("newly-assigned transaction: ", signedTransaction);
      setReAssignedTransactionVariable(signedTransaction);
    } catch (error) {
      console.warn(error);
    }
  };

  const signDemoTransactionWithWindowProvider = async () => {
    if (!publicKey) return;
    try {
      const transaction = await createTransferTransaction(
        publicKey,
        connection
      );
      console.log("unsigned transaction: ", transaction);
      const signedTransaction = await window.phantom.solana.signTransaction(
        transaction
      );
      console.log("previously assigned transaction: ", transaction);
      setTransactionVariable(transaction);
      console.log("newly-assigned transaction: ", signedTransaction);
      setReAssignedTransactionVariable(signedTransaction);
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <div className="App">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <WalletMultiButton />
      </div>
      <p>Please set your wallet to Devnet</p>
      <button onClick={signDemoTransactionWithWalletAdapter}>
        Sign Only with Wallet Adapter
      </button>
      <button onClick={signDemoTransactionWithWindowProvider}>
        Sign Only with Window Provider
      </button>
      <p>{`Transaction Variable: ${
        transactionVariable.signatures
          ? JSON.stringify(transactionVariable.signatures)
          : "Awaiting signature..."
      }`}</p>
      <p>{`Re-assigned Transaction Variable: ${
        reAssignedTransactionVariable.signatures
          ? JSON.stringify(reAssignedTransactionVariable.signatures)
          : "Awaiting signature..."
      }`}</p>
    </div>
  );
};

const App = () => {
  return (
    <Context>
      <Content />
    </Context>
  );
};
export default App;
