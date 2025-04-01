'use client'
import { useEffect, useState } from 'react';

export default function BinanceW3WChecker() {
  const [result, setResult] = useState('Checking...');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window === 'undefined') {
      setResult('window is undefined (running on server)');
      return;
    }

    try {
      const hasSign = typeof window.binancew3w?.pcs?.sign !== 'undefined';
      setResult(
        hasSign 
          ? '✅ window.binancew3w.pcs.sign EXISTS'
          : '❌ window.binancew3w.pcs.sign NOT FOUND'
      );
      
      // Дополнительная информация для отладки
      console.log('Full window.binancew3w:', window.binancew3w);
      console.log('window.binancew3w?.pcs:', window.binancew3w?.pcs);
      console.log('window.binancew3w?.pcs?.sign:', window.binancew3w?.pcs?.sign);
      
    } catch (error) {
      setResult(`Error checking: ${error.message}`);
    }
  }, []);

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'monospace',
      textAlign: 'center',
      marginTop: '50px'
    }}>
      <h1>Binance Web3 Wallet Checker</h1>
      
      <div style={{
        margin: '30px auto',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        maxWidth: '600px',
        fontSize: '18px'
      }}>
        {isClient ? (
          <>
            <p><strong>Result:</strong> {result}</p>
            <p><strong>window.binancew3w:</strong> {window.binancew3w ? 'EXISTS' : 'undefined'}</p>
            <p><strong>window.binancew3w?.pcs:</strong> {window.binancew3w?.pcs ? 'EXISTS' : 'undefined'}</p>
            <p><strong>typeof sign:</strong> {typeof window.binancew3w?.pcs?.sign}</p>
          </>
        ) : (
          <p>Loading client-side check...</p>
        )}
      </div>
      
      <p style={{ marginTop: '30px', color: '#666' }}>
        Check browser console for detailed debug information
      </p>
    </div>
  );
}