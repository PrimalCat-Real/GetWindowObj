'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Функция для безопасного преобразования объектов в строку (с обработкой циклических ссылок)
const safeStringify = (obj: any): string => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  }, 2);
};

export default function CodeRunner() {
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('Результат появится здесь...');

  const runCode = () => {
    // Сохраняем оригинальные методы console
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };
    
    let consoleOutput = '';
    
    // Перехватываем методы console
    const interceptConsole = (method: 'log' | 'warn' | 'error' | 'info') => {
      return (...args: any[]) => {
        originalConsole[method](...args); // сохраняем оригинальный вывод
        consoleOutput += `[${method}] ` + args.map(arg => 
          typeof arg === 'object' ? safeStringify(arg) : String(arg)
        ).join(' ') + '\n';
      };
    };

    console.log = interceptConsole('log');
    console.warn = interceptConsole('warn');
    console.error = interceptConsole('error');
    console.info = interceptConsole('info');

    try {
      setOutput('Выполнение...');
      const result = eval(code);
      
      // Добавляем результат выполнения (если не undefined)
      if (result !== undefined) {
        consoleOutput += 'Результат: ' + 
          (typeof result === 'object' ? safeStringify(result) : String(result));
      }
      
      setOutput(consoleOutput || 'Код выполнен (вывода нет)');
    } catch (e) {
      setOutput(`Ошибка: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      // Восстанавливаем оригинальные методы console
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
    }
  };

  const clearOutput = () => {
    setOutput('Результат появится здесь...');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">JS Console</h1>
      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Введите JavaScript код..."
        className="w-full h-32 font-mono mb-2"
      />
      <div className="flex gap-2 mb-4">
        <Button onClick={runCode}>Выполнить</Button>
        <Button variant="outline" onClick={clearOutput}>Очистить</Button>
      </div>
      <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
        <h2 className="font-semibold mb-2">Вывод:</h2>
        <pre className="whitespace-pre-wrap font-mono p-2 rounded min-h-20">
          {output}
        </pre>
      </div>
    </div>
  );
}