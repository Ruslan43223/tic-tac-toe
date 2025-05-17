import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function App() {
  const { publicKey, connected } = useWallet();

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Indie Flower, cursive' }}>
      <h1>Подключение кошелька Backpack</h1>
      {connected ? (
        <p>Подключен к {publicKey.toString()}</p>
      ) : (
        <WalletMultiButton />
      )}
    </div>
  );
}

export default App;