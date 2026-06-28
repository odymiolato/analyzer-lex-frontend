'use client';

import React, { useState, useCallback } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { translateCode, TargetLanguage, TranslateResponse } from '@/lib/api';

interface CodeTranslatorProps {
  sourceCode: string;
}

const TARGETS: { id: TargetLanguage; label: string; icon: string; lang: string }[] = [
  { id: 'javascript', label: 'JavaScript', icon: 'JS', lang: 'javascript' },
  { id: 'cpp', label: 'C++', icon: 'C++', lang: 'cpp' },
];

export const CodeTranslator: React.FC<CodeTranslatorProps> = ({ sourceCode }) => {
  const [target, setTarget] = useState<TargetLanguage>('javascript');
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTranslate = useCallback(async () => {
    if (!sourceCode.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await translateCode(sourceCode, target);
      if (data.syntaxErrors?.length) {
        setError(`Errores sintácticos: ${data.syntaxErrors.length}. Corrige el código C antes de traducir.`);
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al traducir');
    } finally {
      setLoading(false);
    }
  }, [sourceCode, target]);

  const handleCopy = async () => {
    if (!result?.code) return;
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeTarget = TARGETS.find((t) => t.id === target)!;

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 md:gap-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
        <div className="flex flex-wrap gap-2">
          {TARGETS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTarget(t.id)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                target === t.id
                  ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]'
                  : 'bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {t.icon} → {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleTranslate}
          disabled={loading || !sourceCode.trim()}
          className="sm:ml-auto inline-flex items-center justify-center gap-2 px-4 h-9 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:opacity-85 transition disabled:opacity-45"
        >
          {loading ? '⟳ Traduciendo…' : '⇄ Traducir código'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-2.5 bg-[#2b1117] border border-[#5b202d] rounded-lg text-[#ff9db2] text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Output */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Source preview */}
        <div className="flex flex-col min-h-[200px] lg:min-h-0 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
            <h3 className="text-[11px] tracking-[0.14em] uppercase font-bold text-[var(--text-muted)]">
              Código C (origen)
            </h3>
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            <SyntaxHighlighter
              language="c"
              style={atomOneDark}
              customStyle={{
                margin: 0,
                padding: '16px',
                background: 'transparent',
                fontSize: '13px',
                lineHeight: '1.65',
                minHeight: '100%',
              }}
            >
              {sourceCode || '// Escribe código C en la pestaña Léxico'}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Translated output */}
        <div className="flex flex-col min-h-[200px] lg:min-h-0 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center justify-between shrink-0 gap-2">
            <h3 className="text-[11px] tracking-[0.14em] uppercase font-bold text-[var(--text-muted)]">
              {activeTarget.label} (destino)
            </h3>
            {result?.code && (
              <button
                onClick={handleCopy}
                className="text-[10px] px-2 py-1 rounded border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
              >
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm gap-2">
                <span className="animate-spin">⟳</span> Traduciendo…
              </div>
            ) : result?.code ? (
              <SyntaxHighlighter
                language={activeTarget.lang}
                style={atomOneDark}
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  background: 'transparent',
                  fontSize: '13px',
                  lineHeight: '1.65',
                  minHeight: '100%',
                }}
              >
                {result.code}
              </SyntaxHighlighter>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--text-faint)] text-sm p-6 text-center">
                <span className="text-3xl opacity-30">⇄</span>
                <p>Selecciona un lenguaje destino y pulsa <strong className="text-[var(--text-muted)]">Traducir código</strong></p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {result?.warnings && result.warnings.length > 0 && (
        <div className="shrink-0 px-4 py-3 bg-[#271a0a] border border-[#6b3d10] rounded-lg">
          <p className="text-xs font-semibold text-[#ffa94d] mb-1.5">Advertencias de traducción</p>
          <ul className="text-xs text-[#ffd8a8] space-y-1">
            {result.warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
