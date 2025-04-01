import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";

export default function Home() {
  const [binanceData, setBinanceData] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Этот код выполняется только на клиенте
    setIsClient(true);
    
    if (typeof window !== 'undefined' && typeof window.binancew3w !== 'undefined') {
      setBinanceData(window.binancew3w);
    }
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>

        <h2>Binance Web3 Wallet Data</h2>
        
        {!isClient ? (
          <p>Loading client-side data...</p>
        ) : (
          <div>
            {typeof window === 'undefined' || typeof window.binancew3w?.pcs?.sign === 'undefined' ? (
              <p>Binance Web3 Wallet data is not available or pcs.sign is undefined</p>
            ) : (
              <div>
                <h3>Binance Web3 Wallet data found:</h3>
                <pre>{JSON.stringify(binanceData, null, 2)}</pre>
                
                <h4>pcs.sign details:</h4>
                <pre>{JSON.stringify(window.binancew3w.pcs.sign, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

      </main>
      <footer className={styles.footer}>

      </footer>
    </div>
  );
}