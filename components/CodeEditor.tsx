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
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-lg">

      {/* Header */}
      <div style={{ padding: '10px' }} className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <h2 className="text-xs tracking-[0.18em] uppercase font-semibold text-[var(--text-muted)]">
            Código Fuente
          </h2>
        </div>

        <Button
          onClick={onAnalyze}
          disabled={isLoading || !value.trim()}
          style={{ padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
          className="
          h-8 px-4
          w-20
          bg-[var(--accent)]
          hover:brightness-110
          text-white
          rounded-lg
          text-xs
          font-medium
          transition-all
          duration-200
          shadow-md
        "
        >
          {isLoading ? 'Analizando...' : 'Analizar'}
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden flex">

        {/* Line Numbers */}
        <div
          className="
          min-w-[52px]
          bg-[var(--bg)]
          border-r border-[var(--border)]
          flex flex-col
          items-end
          py-3
          pr-3
          text-[11px]
          text-[var(--text-faint)]
          code-font
          leading-[1.65]
          select-none
        "
        >
          {value.split('\n').map((_, i) => (
            <div
              key={i}
              className="
              h-[25px]
              flex
              items-center
              justify-end
              transition-colors
            "
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div
          className="
          flex-1
          relative
          overflow-hidden
          bg-[var(--bg-panel)]
        "
        >
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            style={{ padding: 'calc(var(--spacing) * 4)' }}
            className="
            sticky
            inset-0
            w-full
            h-full
            p-4
            bg-transparent
            text-transparent
            caret-[var(--accent)]
            resize-none
            focus:outline-none
            code-font
            text-[13px]
            leading-[1.65]
            z-10
          "
          />

          <div className="absolute inset-0 overflow-auto pointer-events-none">
            <SyntaxHighlighter
              language="c"
              style={atomOneDark}
              customStyle={{
                padding: '16px',
                margin: 0,
                background: 'transparent',
                fontSize: '13px',
                lineHeight: '1.65',
                fontFamily:
                  'var(--font-code), Consolas, Monaco, monospace',
              }}
              wrapLines
              codeTagProps={{
                style: {
                  fontFamily:
                    'var(--font-code), Consolas, Monaco, monospace',
                },
              }}
            >
              {value || '// Escribe tu código aquí...'}
            </SyntaxHighlighter>
          </div>

          {/* Glow inferior */}
          <div
            className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-10
            bg-gradient-to-t
            from-black/10
            to-transparent
          "
          />
        </div>
      </div>
    </div>
  );
};
