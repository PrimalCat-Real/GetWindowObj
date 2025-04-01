'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";

export default function Home() {
  const [binanceData, setBinanceData] = useState(null);
  const [windowData, setWindowData] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Этот код выполняется только на клиенте
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      // Собираем данные Binance Web3 Wallet
      if (typeof window.binancew3w !== 'undefined') {
        setBinanceData(window.binancew3w);
      }
      
      // Собираем общие данные из window которые могут быть полезны
      const usefulWindowData = {
        location: window.location,
        navigator: {
          userAgent: window.navigator.userAgent,
          platform: window.navigator.platform,
          language: window.navigator.language,
        },
        screen: {
          width: window.screen.width,
          height: window.screen.height,
        },
        document: {
          referrer: document.referrer,
          title: document.title,
        },
        // Добавляем другие полезные свойства window
        ethereum: window.ethereum,
        web3: window.web3,
        TrustWallet: window.TrustWallet,
        coinbaseWalletExtension: window.coinbaseWalletExtension,
        imToken: window.imToken,
      };
      
      setWindowData(usefulWindowData);
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

            <div style={{ marginTop: '2rem' }}>
              <h3>Window Environment Data:</h3>
              {windowData ? (
                <div>
                  <h4>Location:</h4>
                  <pre>{JSON.stringify(windowData.location, null, 2)}</pre>
                  
                  <h4>Navigator:</h4>
                  <pre>{JSON.stringify(windowData.navigator, null, 2)}</pre>
                  
                  <h4>Screen:</h4>
                  <pre>{JSON.stringify(windowData.screen, null, 2)}</pre>
                  
                  <h4>Document:</h4>
                  <pre>{JSON.stringify(windowData.document, null, 2)}</pre>
                  
                  <h4>Wallet Providers:</h4>
                  <pre>
                    Ethereum: {windowData.ethereum ? 'Available' : 'Not available'}<br />
                    Web3: {windowData.web3 ? 'Available' : 'Not available'}<br />
                    TrustWallet: {windowData.TrustWallet ? 'Available' : 'Not available'}<br />
                    Coinbase: {windowData.coinbaseWalletExtension ? 'Available' : 'Not available'}<br />
                    imToken: {windowData.imToken ? 'Available' : 'Not available'}
                  </pre>
                </div>
              ) : (
                <p>No window data available</p>
              )}
            </div>
          </div>
        )}
      </main>
      <footer className={styles.footer}>
        {/* Footer content */}
      </footer>
    </div>
  );
}