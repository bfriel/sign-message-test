import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  ConnectionProvider,
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

const MESSAGE =
  "To avoid digital dognappers, sign below to authenticate with CryptoCorgis.";

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
  const { publicKey, signMessage } = useWallet();

  const [walletAdapterResult, setWalletAdapterResult] = useState(null);
  const [windowResult, setWindowResult] = useState(null);

  const signMessageWithWalletAdapter = async () => {
    if (!publicKey) return;
    try {
      const encodedMessage = new TextEncoder().encode(MESSAGE);
      const signedMessage = await signMessage(encodedMessage);
      console.log(signedMessage);
      setWalletAdapterResult(signedMessage);
    } catch (error) {
      console.warn(error);
    }
  };

  const signMessageWithWindowProvider = async () => {
    if (!publicKey) return;
    try {
      const encodedMessage = new TextEncoder().encode(MESSAGE);
      const signedMessage = await window.phantom.solana.signMessage(
        encodedMessage
      );
      console.log(signedMessage);
      setWindowResult(signedMessage);
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <div className="App">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 30,
          marginBottom: 30,
        }}
      >
        <WalletMultiButton />
      </div>
      {publicKey ? (
        <>
          <button onClick={signMessageWithWalletAdapter}>
            signMessage with Wallet Adapter
          </button>
          <button onClick={signMessageWithWindowProvider}>
            signMessage with Window Provider
          </button>
          <h3>Wallet Adapter Result</h3>
          <p>
            {walletAdapterResult
              ? JSON.stringify(walletAdapterResult)
              : "Awaiting signature"}
          </p>
          <h3>Window Provider Result</h3>
          <p>
            {" "}
            {windowResult ? JSON.stringify(windowResult) : "Awaiting signature"}
          </p>
        </>
      ) : (
        <p>Please connect your wallet</p>
      )}
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
