'use client';

import React, { useState, useCallback } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { TokenTable } from '@/components/TokenTable';
import { AutomataVisualizer } from '@/components/AutomataVisualizer';
import { Documentation } from '@/components/Documentation';
import { analyzeCode, Token } from '@/lib/api';

interface State {
  id: string;
  label: string;
  isFinal?: boolean;
  isStart?: boolean;
}

interface Transition {
  from: string;
  to: string;
  label: string;
}

type Tab = 'editor' | 'automata' | 'docs';

export const AnalyzerApp: React.FC = () => {
  const [code, setCode] = useState(
    `int main() {
  int x = 10;
  float pi = 3.14;
  char msg = "Hola";
  
  if (x > 5) {
    printf("%d", x);
  }
  
  return 0;
}`
  );
  const [tokens, setTokens] = useState<Token[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('editor');

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeCode(code);
      setTokens(result.tokens || []);

      // Simulamos estados y transiciones para el autómata
      const tokenTypes = Array.from(
        new Set(result.tokens?.map((t) => t.tipo) || [])
      );
      const newStates: State[] = [
        { id: 'q0', label: 'q0', isStart: true },
        ...tokenTypes.map((type, i) => ({
          id: `q${i + 1}`,
          label: `${type}`,
          isFinal: i === tokenTypes.length - 1,
        })),
      ];

      const newTransitions: Transition[] = tokenTypes.map((type, i) => ({
        from: `q${i}`,
        to: `q${i + 1}`,
        label: type,
      }));

      setStates(newStates);
      setTransitions(newTransitions);
      setActiveTab('editor');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al analizar el código'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [code]);

  return (
    <div className="w-full min-h-screen flex flex-col fade-up ui-font">
      <header className="h-14 px-4 md:px-6 border-b border-[var(--border)] bg-[var(--bg-panel)] flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-extrabold tracking-tight text-[18px]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white text-sm flex items-center justify-center">⚡</div>
          <span className="text-[var(--text)]">Analizador</span>
          <span className="text-[var(--accent)]">Lex</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {(['editor', 'automata', 'docs'] as Tab[]).map((tab) => {
            const label = tab === 'editor' ? 'Analizador' : tab === 'automata' ? 'Autómata' : 'Documentación';
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs rounded-md border transition-colors ${
                  active
                    ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]'
                    : 'bg-transparent text-[var(--text-muted)] border-transparent hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !code.trim()}
          className="px-4 py-2 rounded-lg text-xs font-bold tracking-wide text-white bg-[var(--accent)] disabled:opacity-50 hover:brightness-110 transition"
        >
          ▶ {loading ? 'Analizando...' : 'Analizar'}
        </button>
      </header>

      {error && (
        <div className="px-4 md:px-6 py-2 bg-[#2b1117] border-b border-[#5b202d] text-[#ff9db2] text-sm">
          Error: {error}
        </div>
      )}

      <div className="md:hidden px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-panel)] flex gap-1 overflow-x-auto">
        {(['editor', 'automata', 'docs'] as Tab[]).map((tab) => {
          const label = tab === 'editor' ? 'Analizador' : tab === 'automata' ? 'Autómata' : 'Docs';
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs rounded-md border whitespace-nowrap transition-colors ${
                active
                  ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]'
                  : 'bg-transparent text-[var(--text-muted)] border-transparent'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden p-0 md:p-1">
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-[var(--border)] h-full">
            <CodeEditor
              value={code}
              onChange={setCode}
              onAnalyze={handleAnalyze}
              isLoading={loading}
            />
            <TokenTable tokens={tokens} loading={loading} />
          </div>
        )}

        {activeTab === 'automata' && (
          <div className="h-full p-3 md:p-6 overflow-auto">
            <AutomataVisualizer
              states={states}
              transitions={transitions}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="h-full p-3 md:p-6 overflow-auto">
            <Documentation />
          </div>
        )}
      </div>
    </div>
  );
};
