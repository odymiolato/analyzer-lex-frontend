'use client';

import React from 'react';
import { Token } from '@/lib/api';

interface TokenTableProps {
  tokens: Token[];
  loading?: boolean;
}

const tokenTypeColors: Record<string, { bg: string; text: string; badge: string }> = {
  KEYWORD: { bg: '#1e1056', text: '#a78bfa', badge: 'bg-[#1e1056] text-[#a78bfa] border border-[#3d2a9e]' },
  IDENTIFIER: { bg: '#0c2b1f', text: '#34d399', badge: 'bg-[#0c2b1f] text-[#34d399] border border-[#065f46]' },
  NUMBER: { bg: '#1c1000', text: '#fbbf24', badge: 'bg-[#1c1000] text-[#fbbf24] border border-[#78350f]' },
  STRING: { bg: '#2d0e1a', text: '#f472b6', badge: 'bg-[#2d0e1a] text-[#f472b6] border border-[#831843]' },
  OPERATOR: { bg: '#001526', text: '#38bdf8', badge: 'bg-[#001526] text-[#38bdf8] border border-[#075985]' },
  PUNCTUATION: { bg: '#181818', text: '#94a3b8', badge: 'bg-[#181818] text-[#94a3b8] border border-[#334155]' },
  COMMENT: { bg: '#0a1a0a', text: '#6b7280', badge: 'bg-[#0a1a0a] text-[#6b7280] border border-[#1f2937]' },
  TYPE: { bg: '#11001f', text: '#c084fc', badge: 'bg-[#11001f] text-[#c084fc] border border-[#581c87]' },
  BOOLEAN: { bg: '#1a0a00', text: '#fb923c', badge: 'bg-[#1a0a00] text-[#fb923c] border border-[#7c2d12]' },
  ERROR: { bg: '#3d1010', text: '#f55b5b', badge: 'bg-[#3d1010] text-[#f55b5b] border border-[#7f1d1d]' },
};

export const TokenTable: React.FC<TokenTableProps> = ({ tokens, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full"></div>
          </div>
          <p className="mt-2 text-[var(--text-muted)]">Analizando código...</p>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--text-faint)]">Ejecuta el análisis para ver los tokens</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-panel)] h-full min-h-[320px] flex flex-col rounded-xl border border-[var(--border)] shadow-lg overflow-hidden">
      <div className="px-4 sm:px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <h2 className="text-[11px] tracking-[0.14em] uppercase font-bold text-[var(--text-muted)]">Tokens Reconocidos</h2>
        <span className="text-[11px] rounded-full px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)]">{tokens.length} tokens</span>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-xs code-font">
          <thead className="bg-[var(--bg-panel)] border-b border-[var(--border)] sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] font-bold text-[var(--text-muted)]">#</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] font-bold text-[var(--text-muted)]">Lexema</th>
              <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] font-bold text-[var(--text-muted)]">Token</th>
              <th className="px-4 py-3 text-center text-[10px] uppercase tracking-[0.12em] font-bold text-[var(--text-muted)]">Línea</th>
              <th className="px-4 py-3 text-center text-[10px] uppercase tracking-[0.12em] font-bold text-[var(--text-muted)]">Columna</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {tokens.map((token, index) => {
              const typeColor =
                tokenTypeColors[token.tipo] || tokenTypeColors.COMMENT;
              return (
                <tr
                  key={index}
                  className="hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <td className="px-4 py-2.5 text-[var(--text-faint)]">{index + 1}</td>
                  <td className="px-4 py-2.5 text-[var(--text)] max-w-none sm:max-w-[220px] truncate" title={token.lexema}>
                    {token.lexema}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] ui-font font-semibold ${typeColor.badge}`}>
                      {token.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center text-[var(--text-muted)]">
                    {token.linea}
                  </td>
                  <td className="px-4 py-2.5 text-center text-[var(--text-muted)]">
                    {token.columna}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
