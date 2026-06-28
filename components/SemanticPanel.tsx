'use client';

import React, { useState } from 'react';
import { SemanticError, SymbolEntry } from '@/lib/api';

interface Props {
  errors: SemanticError[];
  warnings: SemanticError[];
  symbolTable: SymbolEntry[];
  syntaxErrors: Array<{ message: string; line: number; column: number; token: string }>;
  loading: boolean;
}

type InnerTab = 'issues' | 'symbols';

const kindColor: Record<string, string> = {
  function:  'text-[#79b8ff]',
  variable:  'text-[#9ecbff]',
  parameter: 'text-[#b392f0]',
};

const kindBadge: Record<string, string> = {
  function:  'bg-[#1a2744] text-[#79b8ff] border-[#1e3a6a]',
  variable:  'bg-[#0d2233] text-[#9ecbff] border-[#1a3550]',
  parameter: 'bg-[#1e1a2e] text-[#b392f0] border-[#372860]',
};

export const SemanticPanel: React.FC<Props> = ({ errors, warnings, symbolTable, syntaxErrors, loading }) => {
  const [inner, setInner] = useState<InnerTab>('issues');

  const allIssues = [
    ...syntaxErrors.map(e => ({ message: e.message, line: e.line, column: e.column, severity: 'syntax' as const })),
    ...errors.map(e => ({ ...e, severity: 'error' as const })),
    ...warnings.map(e => ({ ...e, severity: 'warning' as const })),
  ].sort((a, b) => a.line - b.line || a.column - b.column);

  const totalProblems = syntaxErrors.length + errors.length + warnings.length;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)]">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-[var(--border)]">
        {(['issues', 'symbols'] as InnerTab[]).map(tab => {
          const label = tab === 'issues' ? `Problemas (${totalProblems})` : `Tabla de Símbolos (${symbolTable.length})`;
          const active = inner === tab;
          return (
            <button
              key={tab}
              onClick={() => setInner(tab)}
              className={`px-3 py-1.5 text-xs rounded-t-md border-x border-t transition-colors -mb-px ${
                active
                  ? 'bg-[var(--bg)] text-[var(--text)] border-[var(--border)]'
                  : 'bg-transparent text-[var(--text-muted)] border-transparent hover:text-[var(--text)]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm">
          Analizando...
        </div>
      )}

      {!loading && inner === 'issues' && (
        <div className="flex-1 overflow-auto p-4">
          {allIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-[var(--text-muted)]">
              <span className="text-3xl">✓</span>
              <p className="text-sm">Sin problemas detectados</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {allIssues.map((issue, i) => {
                const isSyntax  = issue.severity === 'syntax';
                const isError   = issue.severity === 'error';
                const isWarning = issue.severity === 'warning';
                return (
                  <div
                    key={i}
                    className={`flex gap-3 p-3 rounded-lg border text-sm ${
                      isSyntax  ? 'bg-[#1f0a0a] border-[#6b1a1a] text-[#ffb0b0]' :
                      isError   ? 'bg-[#1f0a0a] border-[#6b1a1a] text-[#ff9db2]' :
                                  'bg-[#1a1500] border-[#5a4500] text-[#ffd680]'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0 font-bold">
                      {isSyntax ? '⚠ SYN' : isError ? '✖ SEM' : '⚠ WARN'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="break-words">{issue.message}</p>
                      {(issue.line > 0 || issue.column > 0) && (
                        <p className="mt-0.5 text-xs opacity-60">
                          Línea {issue.line}, Columna {issue.column}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!loading && inner === 'symbols' && (
        <div className="flex-1 overflow-auto table-scroll">
          {symbolTable.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-[var(--text-muted)] text-sm">
              No se encontraron símbolos
            </div>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-[var(--bg-panel)] z-10">
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                  <th className="py-2 px-4 text-left font-semibold">Nombre</th>
                  <th className="py-2 px-4 text-left font-semibold">Tipo</th>
                  <th className="py-2 px-4 text-left font-semibold">Categoría</th>
                  <th className="py-2 px-3 text-center font-semibold">Ámbito</th>
                  <th className="py-2 px-3 text-center font-semibold">Línea</th>
                  <th className="py-2 px-3 text-center font-semibold">Init</th>
                  <th className="py-2 px-3 text-center font-semibold">Usado</th>
                </tr>
              </thead>
              <tbody>
                {symbolTable.map((sym, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <td className={`py-2 px-4 font-mono font-semibold ${kindColor[sym.kind] ?? 'text-[var(--text)]'}`}>
                      {sym.name}
                    </td>
                    <td className="py-2 px-4 font-mono text-[var(--text-muted)]">{sym.type}</td>
                    <td className="py-2 px-4">
                      <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ${kindBadge[sym.kind] ?? ''}`}>
                        {sym.kind}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center text-[var(--text-muted)]">{sym.scopeLevel}</td>
                    <td className="py-2 px-3 text-center text-[var(--text-muted)]">{sym.line > 0 ? sym.line : '—'}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={sym.initialized ? 'text-green-400' : 'text-red-400'}>
                        {sym.initialized ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={sym.used ? 'text-green-400' : 'text-yellow-400'}>
                        {sym.used ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
