'use client';

import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Button } from '@/components/ui/button';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  onAnalyze,
  isLoading = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        value.substring(0, start) + '\t' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
        <h2 className="text-[11px] tracking-[0.14em] uppercase font-bold text-[var(--text-muted)]">Código Fuente</h2>
        <Button
          onClick={onAnalyze}
          disabled={isLoading || !value.trim()}
          className="hidden md:inline-flex h-7 px-3 bg-[var(--accent)] hover:brightness-110 text-white rounded-md text-xs"
        >
          {isLoading ? 'Analizando...' : 'Analizar'}
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="w-11 bg-[var(--bg)] border-r border-[var(--border)] flex flex-col items-end py-3 pr-2 text-[11px] text-[var(--text-faint)] code-font leading-[1.65]">
          {value
            .split('\n')
            .map((_, i) => (
              <div key={i} className="h-[25px] flex items-center justify-end">
                {i + 1}
              </div>
            ))}
        </div>

        <div className="flex-1 relative overflow-hidden">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full p-3 code-font text-[13px] leading-[1.65] bg-transparent text-transparent caret-[var(--accent)] resize-none focus:outline-none"
            spellCheck="false"
          />
          <div className="absolute inset-0 overflow-auto pointer-events-none">
            <SyntaxHighlighter
              language="c"
              style={atomOneDark}
              customStyle={{
                padding: '12px',
                margin: 0,
                background: 'transparent',
                fontSize: '13px',
                lineHeight: '1.65',
                fontFamily: 'var(--font-code), Consolas, monospace',
              }}
              wrapLines
              codeTagProps={{
                style: {
                  fontFamily: 'var(--font-code), Consolas, monospace',
                  fontSize: 'inherit',
                },
              }}
            >
              {value || '// Escribe tu código aquí...'}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
};
