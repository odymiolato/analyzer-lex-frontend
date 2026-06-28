'use client';

import React, { useState, useCallback } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { TokenTable } from '@/components/TokenTable';
import { AutomataVisualizer } from '@/components/AutomataVisualizer';
import { Documentation } from '@/components/Documentation';
import { CodeTranslator } from '@/components/CodeTranslator';
import { analyzeCode, parseCode, analyzeSemantic, Token, CSTNode, SyntaxError, SemanticError, SymbolEntry } from '@/lib/api';
import { SemanticPanel } from '@/components/SemanticPanel';

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

type Tab = 'editor' | 'syntax' | 'semantic' | 'automata' | 'translate' | 'docs';

/* ─── CST Tree Renderer ─────────────────────────────────── */
const CSTTreeNode: React.FC<{ node: CSTNode; depth?: number }> = ({ node, depth = 0 }) => {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = !hasChildren;

  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : 18 }} className="select-none">
      <div
        className={`flex items-center gap-1.5 py-[3px] px-2 rounded-md cursor-pointer group transition-colors ${isLeaf
          ? 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
          : 'hover:bg-[var(--bg-hover)]'
          }`}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (
          <span className="text-[var(--accent)] text-[10px] w-3 shrink-0 font-bold">
            {open ? '▾' : '▸'}
          </span>
        ) : (
          <span className="w-3 shrink-0 text-[var(--text-muted)] text-[10px]">◆</span>
        )}

        <span className={`text-xs font-semibold ${isLeaf ? 'text-[#7dd3b0]' : 'text-[var(--accent)]'}`}>
          {node.name}
        </span>

        {node.image && (
          <span className="ml-1 text-xs text-[#f0c070] font-mono bg-[#2a2215] px-1.5 py-0.5 rounded">
            {node.image}
          </span>
        )}

        {node.tokenType && (
          <span className="ml-auto text-[10px] text-[var(--text-muted)] font-mono opacity-60">
            {node.tokenType}
          </span>
        )}
      </div>

      {hasChildren && open && (
        <div className="border-l border-[var(--border)] ml-3">
          {node.children!.map((child, i) => (
            <CSTTreeNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Syntax Error List ─────────────────────────────────── */
const SyntaxErrorList: React.FC<{ errors: SyntaxError[] }> = ({ errors }) => {
  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-[var(--text-muted)]">
        <span className="text-2xl">✓</span>
        <span className="text-xs">Sin errores sintácticos</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {errors.map((err, i) => (
        <div key={i} className="flex gap-3 p-3 bg-[#2b1117] border border-[#5b202d] rounded-lg">
          <span className="text-[#ff6b6b] text-sm mt-0.5">✕</span>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-semibold text-[#ff9db2]">
              Línea {err.line}, Col {err.column}
            </span>
            <span className="text-xs text-[#ff9db2]/80 break-words">{err.message}</span>
            {err.token && (
              <span className="text-[10px] font-mono text-[#ff6b6b]/60 mt-1">
                token: <span className="text-[#ff9db2]">{err.token}</span>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── Syntax Panel ──────────────────────────────────────── */
const SyntaxPanel: React.FC<{
  cst: CSTNode | null;
  errors: SyntaxError[];
  loading: boolean;
}> = ({ cst, errors, loading }) => {
  const [view, setView] = useState<'tree' | 'errors'>('tree');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm gap-2">
        <span className="animate-spin">⟳</span> Analizando sintaxis…
      </div>
    );
  }

  if (!cst && errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)]">
        <span className="text-4xl opacity-20">🌲</span>
        <span className="text-sm">Presiona <strong>Analizar</strong> para ver el árbol sintáctico</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tabs */}
      <div className="flex gap-1 px-4 pt-3 pb-2 border-b border-[var(--border)]">
        <button
          onClick={() => setView('tree')}
          className={`px-3 py-1 text-xs rounded-md border transition-colors ${view === 'tree'
            ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]'
            : 'bg-transparent text-[var(--text-muted)] border-transparent hover:bg-[var(--bg-hover)]'
            }`}
        >
          🌲 Árbol CST
        </button>
        <button
          onClick={() => setView('errors')}
          className={`px-3 py-1 text-xs rounded-md border transition-colors flex items-center gap-1.5 ${view === 'errors'
            ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]'
            : 'bg-transparent text-[var(--text-muted)] border-transparent hover:bg-[var(--bg-hover)]'
            }`}
        >
          ⚠ Errores
          {errors.length > 0 && (
            <span className="bg-[#ff4444] text-white text-[10px] font-bold px-1.5 rounded-full">
              {errors.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {view === 'tree' ? (
          cst ? (
            <div className="font-mono text-xs">
              <CSTTreeNode node={cst} />
            </div>
          ) : (
            <div className="text-[var(--text-muted)] text-xs text-center py-8">
              No se pudo generar el árbol (revisa los errores)
            </div>
          )
        ) : (
          <SyntaxErrorList errors={errors} />
        )}
      </div>
    </div>
  );
};

/* ─── Main App ──────────────────────────────────────────── */
export const AnalyzerApp: React.FC = () => {
  const [code, setCode] = useState(
    `int main() {\n  int x = 10;\n  float pi = 3.14;\n  char msg = "Hola";\n\n  if (x > 5) {\n    printf("%d", x);\n  }\n\n  return 0;\n}`
  );
  const [tokens, setTokens] = useState<Token[]>([]);
  const [cst, setCst] = useState<CSTNode | null>(null);
  const [syntaxErrors, setSyntaxErrors] = useState<SyntaxError[]>([]);
  const [semanticErrors, setSemanticErrors] = useState<SemanticError[]>([]);
  const [semanticWarnings, setSemanticWarnings] = useState<SemanticError[]>([]);
  const [symbolTable, setSymbolTable] = useState<SymbolEntry[]>([]);
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
      // Léxico + Sintáctico + Semántico en paralelo
      const [lexResult, syntaxResult, semResult] = await Promise.all([
        analyzeCode(code),
        parseCode(code),
        analyzeSemantic(code),
      ]);

      // Tokens
      setTokens(lexResult.tokens || []);

      // CST + errores sintácticos
      setCst(syntaxResult.cst || null);
      setSyntaxErrors(syntaxResult.errors || []);

      // Semántico
      setSemanticErrors(semResult.semantic?.errors ?? []);
      setSemanticWarnings(semResult.semantic?.warnings ?? []);
      setSymbolTable(semResult.semantic?.symbolTable ?? []);

      // Autómata
      const tokenTypes = Array.from(new Set(lexResult.tokens?.map((t) => t.tipo) || []));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar el código');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [code]);

  const tabs: { id: Tab; label: string; mobileLabel: string; icon: string }[] = [
    { id: 'editor',    label: 'Léxico',        mobileLabel: 'Léxico',   icon: '⌨'  },
    { id: 'syntax',    label: 'Sintáctico',     mobileLabel: 'Sint.',    icon: '🌲' },
    { id: 'semantic',  label: 'Semántico',       mobileLabel: 'Sem.',     icon: '🔍' },
    { id: 'automata',  label: 'Autómata',        mobileLabel: 'Autómata', icon: '◎'  },
    { id: 'translate', label: 'Traductor',       mobileLabel: 'Trad.',    icon: '⇄'  },
    { id: 'docs',      label: 'Documentación',  mobileLabel: 'Docs',     icon: '📄' },
  ];

  const hasSyntaxErrors   = syntaxErrors.length > 0;
  const semanticIssues    = semanticErrors.length + semanticWarnings.length;

  return (
    <div className="w-full h-screen flex flex-col fade-up ui-font overflow-hidden">
      {/* ── Header ── */}
      <header className="shrink-0 h-14 px-3 sm:px-4 md:px-6 border-b border-[var(--border)] bg-[var(--bg-panel)] flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 font-extrabold tracking-tight text-base sm:text-[18px] shrink-0 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white text-sm flex items-center justify-center shrink-0">⚡</div>
          <span className="text-[var(--text)] hidden xs:inline">Analizador</span>
          <span className="text-[var(--accent)]">C</span>
        </div>

        {/* Desktop tabs */}
        <div className="flex-1 min-w-0 hidden lg:flex items-center justify-center gap-2 xl:gap-3 overflow-x-auto px-2">
          {tabs.map(({ id, label, icon }) => {
            const active = activeTab === id;
            const badge = (id === 'syntax' && hasSyntaxErrors) || (id === 'semantic' && semanticIssues > 0);
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative px-3 xl:px-4 py-2 text-xs rounded-md border transition-colors flex items-center gap-1.5 shrink-0 ${active
                  ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]'
                  : 'bg-transparent text-[var(--text-muted)] border-transparent hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                  }`}
              >
                <span>{icon}</span>
                <span className="hidden xl:inline">{label}</span>
                {badge && (
                  <span className="bg-[#ff4444] text-white text-[9px] font-bold px-1 rounded-full">
                    {id === 'semantic' ? semanticIssues : syntaxErrors.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="ml-auto shrink-0">
          <button
            onClick={handleAnalyze}
            disabled={loading || !code.trim()}
            className="inline-flex items-center gap-2 px-3 sm:px-4 h-9 rounded-lg text-xs font-medium tracking-wide bg-[var(--accent)] text-white hover:opacity-85 active:scale-[0.97] transition disabled:opacity-45"
          >
            {loading ? '⟳…' : '▶ Analizar'}
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="px-4 md:px-6 py-2 bg-[#2b1117] border-b border-[#5b202d] text-[#ff9db2] text-sm flex items-center gap-2">
          <span>✕</span> {error}
        </div>
      )}

      {/* Syntax warning banner */}
      {!error && hasSyntaxErrors && (
        <div
          onClick={() => setActiveTab('syntax')}
          className="px-4 md:px-6 py-2 bg-[#271a0a] border-b border-[#6b3d10] text-[#ffa94d] text-xs flex items-center gap-2 cursor-pointer hover:bg-[#2f2010] transition-colors"
        >
          <span>⚠</span>
          {syntaxErrors.length} error{syntaxErrors.length > 1 ? 'es' : ''} sintáctico{syntaxErrors.length > 1 ? 's' : ''} encontrado{syntaxErrors.length > 1 ? 's' : ''} —{' '}
          <span className="underline">ver detalles</span>
        </div>
      )}

      {/* Mobile / tablet tabs */}
      <div className="lg:hidden shrink-0 px-3 sm:px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-panel)] flex gap-2 overflow-x-auto">
        {tabs.map(({ id, mobileLabel, icon }) => {
          const active = activeTab === id;
          const badge = (id === 'syntax' && hasSyntaxErrors) || (id === 'semantic' && semanticIssues > 0);
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative px-3.5 py-2 text-xs rounded-md border whitespace-nowrap transition-colors flex items-center gap-1.5 ${active
                ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]'
                : 'bg-transparent text-[var(--text-muted)] border-transparent'
                }`}
            >
              {icon} {mobileLabel}
              {badge && (
                <span className="bg-[#ff4444] text-white text-[9px] font-bold px-1 rounded-full">
                  {id === 'semantic' ? semanticIssues : syntaxErrors.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-h-0 overflow-hidden p-3 sm:p-4 md:p-5">
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4 h-full min-h-0">
            <CodeEditor
              value={code}
              onChange={setCode}
              onAnalyze={handleAnalyze}
              isLoading={loading}
            />
            <TokenTable tokens={tokens} loading={loading} />
          </div>
        )}

        {activeTab === 'syntax' && (
          <div className="h-full bg-[var(--bg-panel)]">
            <SyntaxPanel cst={cst} errors={syntaxErrors} loading={loading} />
          </div>
        )}

        {activeTab === 'semantic' && (
          <div className="h-full overflow-hidden">
            <SemanticPanel
              errors={semanticErrors}
              warnings={semanticWarnings}
              symbolTable={symbolTable}
              syntaxErrors={syntaxErrors}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'automata' && (
          <div className="h-full min-h-0 p-3 md:p-6 overflow-auto">
            <AutomataVisualizer states={states} transitions={transitions} loading={loading} />
          </div>
        )}

        {activeTab === 'translate' && (
          <div className="h-full min-h-0 p-3 md:p-6 overflow-hidden">
            <CodeTranslator sourceCode={code} />
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="h-full min-h-0 p-3 md:p-6 overflow-auto">
            <Documentation />
          </div>
        )}
      </div>
    </div>
  );
};