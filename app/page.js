'use client'
import { useEffect, useState } from 'react';

const WindowViewer = () => {
  const [windowData, setWindowData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Безопасное получение свойств объекта с ограничением глубины
  const getSafeWindowData = (obj, depth = 0, maxDepth = 3) => {
    if (depth > maxDepth) return '[Max depth reached]';
    if (obj === null) return 'null';
    if (typeof obj !== 'object') return obj;

    const result = {};
    const props = Object.getOwnPropertyNames(obj).slice(0, 200); // Ограничиваем количество свойств
    
    for (const prop of props) {
      try {
        const value = obj[prop];
        if (typeof value === 'function') {
          result[prop] = `[Function ${value.name || 'anonymous'}]`;
        } else if (typeof value === 'object' && value !== null) {
          result[prop] = getSafeWindowData(value, depth + 1, maxDepth);
        } else {
          result[prop] = value;
        }
      } catch {
        result[prop] = '[Access denied]';
      }
    }
    return result;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const data = getSafeWindowData(window);
      setWindowData(data);
    } catch (error) {
      setWindowData({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderObject = (obj, depth = 0) => {
    if (typeof obj === 'string') return <span>{obj}</span>;
    if (obj === null) return <span>null</span>;
    if (typeof obj !== 'object') return <span>{String(obj)}</span>;

    return (
      <div style={{ marginLeft: `${depth * 15}px` }}>
        {Object.entries(obj).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong>
            {typeof value === 'object' ? (
              renderObject(value, depth + 1)
            ) : (
              <span> {String(value)}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading window data...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Window Object Inspector</h1>
      <div style={{
        padding: '15px',
        borderRadius: '5px',
        marginTop: '20px',
        maxHeight: '70vh',
        overflow: 'auto'
      }}>
        {renderObject(windowData)}
      </div>
    </div>
  );
};

export default WindowViewer;