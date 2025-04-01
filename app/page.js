'use client'
import { useEffect, useState } from 'react';

export default function BinanceW3WChecker() {
  const [result, setResult] = useState('Checking...');
  const [isClient, setIsClient] = useState(false);
  const [signResult, setSignResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Поля ввода
  const [inputs, setInputs] = useState({
    binanceChainId: '',
    contractAddress: '',
    address: ''
  });

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
      
      console.log('Full window.binancew3w:', window.binancew3w);
      console.log('window.binancew3w?.pcs:', window.binancew3w?.pcs);
      console.log('window.binancew3w?.pcs?.sign:', window.binancew3w?.pcs?.sign);
      
    } catch (error) {
      setResult(`Error checking: ${error.message}`);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSign = async () => {
    if (!window.binancew3w?.pcs?.sign) {
      setSignResult({ error: 'Sign function not available!' });
      return;
    }

    if (!inputs.binanceChainId || !inputs.contractAddress || !inputs.address) {
      setSignResult({ error: 'Please fill all fields!' });
      return;
    }

    try {
      setLoading(true);
      setSignResult(null);
      
      const result = await window.binancew3w.pcs.sign({
        binanceChainId: inputs.binanceChainId,
        contractAddress: inputs.contractAddress,
        address: inputs.address,
      });

      console.log('Sign result:', result);
      setSignResult(result);

    } catch (error) {
      console.error('Sign error:', error);
      setSignResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'monospace',
      textAlign: 'center',
      marginTop: '50px',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
    }}>
      <h1>Binance Web3 Wallet Checker</h1>
      
      <div style={{
        margin: '30px auto',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #ddd',
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

      <div style={{
        margin: '20px 0',
        padding: '20px',
        border: '1px solid #eee',
        borderRadius: '8px',
      }}>
        <h3>Sign Request</h3>
        
        <div style={{ margin: '15px 0' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Binance Chain ID:</label>
          <input
            type="text"
            name="binanceChainId"
            value={inputs.binanceChainId}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ margin: '15px 0' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contract Address:</label>
          <input
            type="text"
            name="contractAddress"
            value={inputs.contractAddress}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ margin: '15px 0' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Address:</label>
          <input
            type="text"
            name="address"
            value={inputs.address}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        <button
          onClick={handleSign}
          disabled={loading}
          style={{
            padding: '10px 20px',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          {loading ? 'Processing...' : 'Sign'}
        </button>
      </div>

      {signResult && (
        <div style={{
          margin: '20px 0',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          textAlign: 'left'
        }}>
          <h3>Sign Result:</h3>
          
          {signResult.error ? (
            <div style={{ color: 'red' }}>Error: {signResult.error}</div>
          ) : signResult.code === "000000" ? (
            <div>
              <div><strong>Signature:</strong> {signResult.data?.signature || 'N/A'}</div>
              <div><strong>Expire At:</strong> {signResult.data?.expireAt || 'N/A'}</div>
            </div>
          ) : (
            <div style={{ color: 'orange' }}>
              Code: {signResult.code} - {signResult.message || 'Unknown error'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}