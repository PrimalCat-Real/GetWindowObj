'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

// Функция для безопасного вывода объектов
const formatOutput = (value: any): string => {
  if (typeof value === 'function') {
    return value.toString()
  }
  
  const cache = new Set()
  return JSON.stringify(value, (key, val) => {
    if (typeof val === 'object' && val !== null) {
      if (cache.has(val)) return '[Circular]'
      cache.add(val)
    }
    return val
  }, 2)
}

export default function CodeRunner() {
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('Результат появится здесь...')

  const runCode = () => {
    const originalConsole = { ...console }
    let consoleOutput = ''

    // Перехватываем console.log
    console.log = (...args) => {
      originalConsole.log(...args)
      consoleOutput += args.map(arg => formatOutput(arg)).join(' ') + '\n'
    }

    try {
      setOutput('Выполнение...')
      const result = eval(code)
      
      if (result !== undefined) {
        consoleOutput += `Результат: ${formatOutput(result)}`
      }
      
      setOutput(consoleOutput || 'Код выполнен (вывода нет)')
    } catch (e) {
      setOutput(`Ошибка: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      console.log = originalConsole.log
    }
  }

  const clearOutput = () => {
    setOutput('Результат появится здесь...')
  }

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
  )
}