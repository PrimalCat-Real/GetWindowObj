'use client';
// @ts-nocheck
import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export default function BinanceW3WChecker() {
  const [result, setResult] = useState<string>('Checking...');
  const [isClient, setIsClient] = useState<boolean>(false);
  const [signResults, setSignResults] = useState<SignResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<string>('');
  const [binanceChainId, setBinanceChainId] = useState<string>('56');
  const [contractAddress, setContractAddress] = useState<string>('');

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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

  const handleAddressesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddresses(e.target.value);
  };

  const handleSignAll = async () => {
    if (!window.binancew3w?.pcs?.sign) {
      setSignResults([{
        address: 'N/A', error: 'Sign function not available!',
        code: ''
      }]);
      return;
    }

    if (!binanceChainId || !contractAddress || !addresses) {
      setSignResults([{
        address: 'N/A', error: 'Please fill all fields!',
        code: ''
      }]);
      return;
    }

    setLoading(true);
    setSignResults([]);
    const addressList = addresses.split('\n').map((addr) => addr.trim()).filter(Boolean);
    const results: SignResult[] = [];

    for (const address of addressList) {
      try {
        const signResult = await window.binancew3w.pcs.sign({
          binanceChainId: binanceChainId,
          contractAddress: contractAddress,
          address: address,
        });
        console.log(`Sign result for ${address}:`, signResult);
        results.push({ address, code: signResult.code, message: signResult.message, signature: signResult.data?.signature, expireAt: signResult.data?.expireAt });
      } catch (error: any) {
        console.error(`Sign error for ${address}:`, error);
        results.push({
          address, error: error.message,
          code: ''
        });
      }
    }

    setSignResults(results);
    setLoading(false);
  };

  const columns: ColumnDef<SignResult>[] = [
    {
      accessorKey: 'address',
      header: 'Address',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const result = row.original;
        if (result.error && result.code != '000000') {
          return <div className="text-red-500">Error</div>;
        } else if (result.code === '000000') {
          return <div className="text-green-500">Success</div>;
        } else if (result.code) {
          return <div className="text-orange-500">Code: {result.code}</div>;
        }
        return <div>Checking...</div>;
      },
    },
    {
      accessorKey: 'signature',
      header: 'Signature',
    },
    {
      accessorKey: 'expireAt',
      header: 'Expire At',
      cell: ({ row }) => {
        const expireAt = row.original.expireAt;
        return <div>{expireAt ? new Date(expireAt).toLocaleString() : 'N/A'}</div>;
      },
    },
    {
      accessorKey: 'error',
      header: 'Error',
      cell: ({ row }) => {
        const error = row.original.error;
        return <div className="text-red-500">{error || 'N/A'}</div>;
      },
    },
  ];

  const table = useReactTable({
    data: signResults,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div
      className='p-5 text-center mt-10 sm:max-w-[800px] max-w-screen m-auto flex flex-col gap-5'
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
        <h3 className='text-center text-xl'>Sign Request for Multiple Addresses</h3>
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
        <label>Addresses (one per line):</label>
        <Textarea
          name="addresses"
          value={addresses}
          onChange={handleAddressesChange}
          className="resize-none"
          rows={5}
        />

        <Button
          className='w-full mt-4'
          onClick={handleSignAll}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Sign All'}
        </Button>
      </div>

      {signResults.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}