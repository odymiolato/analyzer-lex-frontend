'use client';

import React, { useState, useCallback } from 'react';
import { generateTargetCode, TargetCodeResponse } from '@/lib/api';

interface Props {
  sourceCode: string;
}

export const TargetCodeGenerator: React.FC<Props> = ({ sourceCode }) => {
  const [result, setResult] = useState<TargetCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!sourceCode.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateTargetCode(sourceCode);
      if (data.syntaxErrors?.length) {
        setError(`Errores sintácticos: ${data.syntaxErrors.length}. Corrige el código C antes de generar código destino.`);
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar código destino');
    } finally {
      setLoading(false);
    }
  }, [sourceCode]);

  const handleCopy = async () => {
    if (!result?.listing) return;
    await navigator.clipboard.writeText(result.listing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const functionCount = result?.program?.functions?.length ?? 0;
  const instructionCount =
    (result?.program?.globals?.length ?? 0) +
    (result?.program?.functions?.reduce((acc, f) => acc + f.code.length, 0) ?? 0);

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 md:gap-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
        <div className="text-xs text-[var(--text-muted)]">
          Genera código de tres direcciones (TAC) — el código destino intermedio del compilador.
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !sourceCode.trim()}
          className="sm:ml-auto inline-flex items-center justify-center gap-2 px-4 h-9 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:opacity-85 transition disabled:opacity-45 shrink-0"
        >
          {loading ? '⟳ Generando…' : '⚙ Generar código destino'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-2.5 bg-[#2b1117] border border-[#5b202d] rounded-lg text-[#ff9db2] text-xs sm:text-sm shrink-0">
          {error}
        </div>
      )}

      {result?.listing && (
        <div className="flex items-center gap-3 shrink-0 text-[11px] text-[var(--text-muted)]">
          <span>{functionCount} función{functionCount !== 1 ? 'es' : ''}</span>
          <span>·</span>
          <span>{instructionCount} instrucciones</span>
        </div>
      )}

      {/* Output */}
      <div className="flex-1 min-h-0 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] overflow-hidden flex flex-col">
        <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
          <h3 className="text-[11px] tracking-[0.14em] uppercase font-bold text-[var(--text-muted)]">
            Código de tres direcciones (TAC)
          </h3>
          {result?.listing && (
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
              <span className="animate-spin">⟳</span> Generando código destino…
            </div>
          ) : result?.listing ? (
            <pre className="p-4 text-xs font-mono leading-relaxed text-[var(--text)] whitespace-pre">
              {result.listing}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--text-faint)] text-sm p-6 text-center">
              <span className="text-3xl opacity-30">⚙</span>
              <p>
                Pulsa <strong className="text-[var(--text-muted)]">Generar código destino</strong> para ver el
                código de tres direcciones
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
