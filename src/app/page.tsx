'use client';
// @ts-nocheck
import * as React from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CodeRunner from '@/components/CodeRunner';

interface BinanceW3W {
  pcs?: {
    sign?: (params: {
      binanceChainId: string;
      contractAddress: string;
      address: string;
    }) => Promise<{
      code: string;
      message?: string;
      data?: {
        signature: string;
        expireAt: number;
      };
    }>;
  };
}

declare global {
  interface Window {
    binancew3w?: BinanceW3W;
  }
}

interface SignResult {
  address: string;
  code: string;
  message?: string;
  signature?: string;
  expireAt?: number;
  error?: string;
}

export default function BinanceW3WCheckerSingle() {
  const [result, setResult] = useState<string>('Checking...');
  const [isClient, setIsClient] = useState<boolean>(false);
  const [signResult, setSignResult] = useState<SignResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [binanceChainId, setBinanceChainId] = useState<string>('56');
  const [contractAddress, setContractAddress] = useState<string>('');

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
    } catch (error: any) {
      setResult(`Error checking: ${error.message}`);
    }
  }, []);

  const handleBinanceChainIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBinanceChainId(e.target.value);
  };

  const handleContractAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContractAddress(e.target.value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleSign = async () => {
    if (!window.binancew3w?.pcs?.sign) {
      setSignResult({ address: 'N/A', error: 'Sign function not available!', code: '' });
      return;
    }

    if (!binanceChainId || !contractAddress || !address) {
      setSignResult({ address: 'N/A', error: 'Please fill all fields!', code: '' });
      return;
    }

    setLoading(true);
    setSignResult(null);

    try {
      const signData = await window.binancew3w.pcs.sign({
        binanceChainId: binanceChainId,
        contractAddress: contractAddress,
        address: address,
      });
      console.log('Sign result:', signData);
      setSignResult({
        address: address,
        code: signData.code,
        message: signData.message,
        signature: signData.data?.signature,
        expireAt: signData.data?.expireAt,
        error: undefined,
      });
    } catch (error: any) {
      console.error('Sign error:', error);
      setSignResult({ address: address, error: error.message, code: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className='p-5 text-center mt-10 sm:max-w-[600px] max-w-screen m-auto flex flex-col gap-5'
    >
      <h1>Binance Web3 Wallet Checker</h1>

      <div className='border-[1px] border-border rounded-md p-4'>
        {isClient ? (
          <>
            <p>
              <strong>Result:</strong> {result}
            </p>
            <p>
              <strong>window.binancew3w:</strong>{' '}
              {window.binancew3w ? 'EXISTS' : 'undefined'}
            </p>
            <p>
              <strong>window.binancew3w?.pcs:</strong>{' '}
              {window.binancew3w?.pcs ? 'EXISTS' : 'undefined'}
            </p>
            <p>
              <strong>typeof sign:</strong>{' '}
              {typeof window.binancew3w?.pcs?.sign}
            </p>
          </>
        ) : (
          <p>Loading client-side check...</p>
        )}
        <CodeRunner></CodeRunner>
      </div>

      <div className='rounded-md border border-border p-4 flex flex-col gap-2 text-left text-sm'>
        <h3 className='text-center text-xl'>Sign Request for Single Address</h3>
        <label>Binance Chain ID:</label>
        <Input
          type="text"
          name="binanceChainId"
          value={binanceChainId}
          onChange={handleBinanceChainIdChange}
        />
        <label>Contract Address:</label>
        <Input
          type="text"
          name="contractAddress"
          value={contractAddress}
          onChange={handleContractAddressChange}
        />
        <label>Address:</label>
        <Input
          type="text"
          name="address"
          value={address}
          onChange={handleAddressChange}
        />

        <Button
          className='w-full mt-4'
          onClick={handleSign}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Sign'}
        </Button>
      </div>

      {signResult && (
        <div className="rounded-md border border-border p-4 text-left text-sm">
          <h3 className="text-xl mb-2">Sign Result:</h3>
          <p><strong>Address:</strong> {signResult.address}</p>
          <p><strong>Code:</strong> {signResult.code}</p>
          {signResult.message && <p><strong>Message:</strong> {signResult.message}</p>}
          {signResult.signature && <p><strong>Signature:</strong> {signResult.signature}</p>}
          {signResult.expireAt && (
            <p><strong>Expire At:</strong> {new Date(signResult.expireAt).toLocaleString()}</p>
          )}
          {signResult.error && <p className="text-red-500"><strong>Error:</strong> {signResult.error}</p>}
        </div>
      )}
    </div>
  );
}