'use client';

import React, { useState, useCallback } from 'react';
import { optimizeCode, OptimizeResponse } from '@/lib/api';

interface Props {
  sourceCode: string;
}

const PASS_ICONS: Record<string, string> = {
  'Plegado de constantes': '🔢',
  'Simplificación algebraica': '➗',
  'Propagación de copias/constantes': '➡',
  'Eliminación de subexpresiones comunes': '♻',
  'Plegado de saltos constantes': '🔀',
  'Eliminación de código inalcanzable': '✂',
  'Optimización de saltos': '↪',
  'Eliminación de código muerto': '🗑',
};

export const CodeOptimizer: React.FC<Props> = ({ sourceCode }) => {
  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'diff' | 'log'>('diff');

  const handleOptimize = useCallback(async () => {
    if (!sourceCode.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await optimizeCode(sourceCode);
      if (data.syntaxErrors?.length) {
        setError(`Errores sintácticos: ${data.syntaxErrors.length}. Corrige el código C antes de optimizar.`);
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al optimizar');
    } finally {
      setLoading(false);
    }
  }, [sourceCode]);

  const passCounts = (result?.applied ?? []).reduce<Record<string, number>>((acc, a) => {
    acc[a.pass] = (acc[a.pass] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 md:gap-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
        <div className="text-xs text-[var(--text-muted)]">
          Aplica optimizaciones clásicas (plegado de constantes, propagación, CSE, eliminación de código muerto/inalcanzable, saltos) hasta un punto fijo.
        </div>
        <button
          onClick={handleOptimize}
          disabled={loading || !sourceCode.trim()}
          className="sm:ml-auto inline-flex items-center justify-center gap-2 px-4 h-9 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:opacity-85 transition disabled:opacity-45 shrink-0"
        >
          {loading ? '⟳ Optimizando…' : '⚡ Optimizar código'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-2.5 bg-[#2b1117] border border-[#5b202d] rounded-lg text-[#ff9db2] text-xs sm:text-sm shrink-0">
          {error}
        </div>
      )}

      {result?.optimized?.listing !== undefined && !error?.includes('Errores sintácticos') && result.stats.instructionsBefore > 0 && (
        <div className="flex flex-wrap items-center gap-3 shrink-0 text-[11px] text-[var(--text-muted)]">
          <span className="px-2 py-1 rounded border border-[var(--border)]">
            Antes: <strong className="text-[var(--text)]">{result.stats.instructionsBefore}</strong> instrucciones
          </span>
          <span className="px-2 py-1 rounded border border-[var(--border)]">
            Después: <strong className="text-[var(--text)]">{result.stats.instructionsAfter}</strong> instrucciones
          </span>
          <span className="px-2 py-1 rounded border border-[var(--accent)] text-[var(--accent)]">
            −{result.stats.removed} ({result.stats.instructionsBefore > 0
              ? Math.round((result.stats.removed / result.stats.instructionsBefore) * 100)
              : 0}%)
          </span>
          <span className="px-2 py-1 rounded border border-[var(--border)]">
            {result.applied.length} optimización{result.applied.length !== 1 ? 'es' : ''} aplicada{result.applied.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Sub-tabs */}
      {result && (
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setView('diff')}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              view === 'diff'
                ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]'
                : 'bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            Antes / Después
          </button>
          <button
            onClick={() => setView('log')}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors flex items-center gap-1.5 ${
              view === 'log'
                ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]'
                : 'bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            Optimizaciones aplicadas
            {result.applied.length > 0 && (
              <span className="bg-[var(--accent)] text-white text-[10px] font-bold px-1.5 rounded-full">
                {result.applied.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm gap-2">
            <span className="animate-spin">⟳</span> Optimizando…
          </div>
        ) : !result?.optimized?.listing ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-[var(--text-faint)] text-sm p-6 text-center border border-[var(--border)] rounded-xl bg-[var(--bg-panel)]">
            <span className="text-3xl opacity-30">⚡</span>
            <p>
              Pulsa <strong className="text-[var(--text-muted)]">Optimizar código</strong> para ver el resultado
            </p>
          </div>
        ) : view === 'diff' ? (
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            <div className="flex flex-col min-h-[200px] lg:min-h-0 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[var(--border)] shrink-0">
                <h3 className="text-[11px] tracking-[0.14em] uppercase font-bold text-[var(--text-muted)]">
                  Original
                </h3>
              </div>
              <div className="flex-1 overflow-auto min-h-0">
                <pre className="p-4 text-xs font-mono leading-relaxed text-[var(--text)] whitespace-pre">
                  {result.original.listing}
                </pre>
              </div>
            </div>
            <div className="flex flex-col min-h-[200px] lg:min-h-0 rounded-xl border border-[var(--accent)] bg-[var(--bg-panel)] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[var(--border)] shrink-0">
                <h3 className="text-[11px] tracking-[0.14em] uppercase font-bold text-[var(--accent)]">
                  Optimizado
                </h3>
              </div>
              <div className="flex-1 overflow-auto min-h-0">
                <pre className="p-4 text-xs font-mono leading-relaxed text-[var(--text)] whitespace-pre">
                  {result.optimized.listing}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 border-b border-[var(--border)] shrink-0 flex flex-wrap gap-x-4 gap-y-1">
              {Object.entries(passCounts).map(([pass, count]) => (
                <span key={pass} className="text-[11px] text-[var(--text-muted)]">
                  {PASS_ICONS[pass] ?? '•'} {pass} <strong className="text-[var(--text)]">×{count}</strong>
                </span>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-4">
              {result.applied.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-[var(--text-muted)]">
                  <span className="text-2xl">✓</span>
                  <span className="text-xs">No se encontraron optimizaciones aplicables</span>
                </div>
              ) : (
                <ol className="flex flex-col gap-1.5">
                  {result.applied.map((a, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-xs font-mono px-2.5 py-1.5 rounded-md bg-[var(--bg-hover)] border border-[var(--border)]"
                    >
                      <span className="shrink-0">{PASS_ICONS[a.pass] ?? '•'}</span>
                      <span className="text-[var(--text-muted)] break-all">{a.description}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
