'use client';

import React, { useEffect, useRef, useState } from 'react';
import { streamBuild, downloadBuildUrl, BuildEvent, BuildPhase, BuildStatus } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  sourceCode: string;
}

interface PhaseRow {
  key: BuildPhase;
  label: string;
  icon: string;
}

interface PhaseState {
  status: 'pending' | BuildStatus;
  message?: string;
  detail?: unknown;
}

const PHASES: PhaseRow[] = [
  { key: 'lexico', label: 'Análisis léxico', icon: '⌨' },
  { key: 'sintactico', label: 'Análisis sintáctico', icon: '🌲' },
  { key: 'semantico', label: 'Análisis semántico', icon: '🔍' },
  { key: 'codigo_intermedio', label: 'Código intermedio (TAC)', icon: '⚙' },
  { key: 'optimizacion', label: 'Optimización', icon: '⚡' },
  { key: 'generacion_codigo', label: 'Generación de código destino', icon: '🖨' },
  { key: 'ensamblado_enlace', label: 'Ensamblado y enlace', icon: '🔗' },
];

const emptyPhases = (): Record<BuildPhase, PhaseState> => ({
  lexico: { status: 'pending' },
  sintactico: { status: 'pending' },
  semantico: { status: 'pending' },
  codigo_intermedio: { status: 'pending' },
  optimizacion: { status: 'pending' },
  generacion_codigo: { status: 'pending' },
  ensamblado_enlace: { status: 'pending' },
  listo: { status: 'pending' },
});

function StatusIcon({ status }: { status: PhaseState['status'] }) {
  switch (status) {
    case 'ok':
      return <span className="text-[#4ade80]">✓</span>;
    case 'warning':
      return <span className="text-[#ffa94d]">⚠</span>;
    case 'error':
      return <span className="text-[#ff6b6b]">✕</span>;
    case 'running':
      return <span className="text-[var(--accent)] animate-spin inline-block">⟳</span>;
    default:
      return <span className="text-[var(--text-faint)]">○</span>;
  }
}

function DetailList({ detail }: { detail: unknown }) {
  if (!Array.isArray(detail) || detail.length === 0) return null;
  return (
    <ul className="mt-1.5 flex flex-col gap-1">
      {detail.slice(0, 8).map((item, i) => {
        const obj = item as { message?: string; line?: number; column?: number };
        const loc =
          typeof obj?.line === 'number' && obj.line > 0
            ? ` (línea ${obj.line}${typeof obj.column === 'number' ? `, col ${obj.column}` : ''})`
            : '';
        return (
          <li key={i} className="text-[11px] text-[var(--text-muted)] font-mono break-words">
            • {obj?.message ?? String(item)}
            {loc}
          </li>
        );
      })}
      {detail.length > 8 && (
        <li className="text-[11px] text-[var(--text-faint)]">…y {detail.length - 8} más</li>
      )}
    </ul>
  );
}

export const BuildModal: React.FC<Props> = ({ open, onClose, sourceCode }) => {
  const [phases, setPhases] = useState<Record<BuildPhase, PhaseState>>(emptyPhases());
  const [finalEvent, setFinalEvent] = useState<BuildEvent | null>(null);
  const [running, setRunning] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const start = () => {
    setPhases(emptyPhases());
    setFinalEvent(null);
    setFatalError(null);
    setRunning(true);

    const controller = new AbortController();
    abortRef.current = controller;

    streamBuild(
      sourceCode,
      (event) => {
        if (event.phase === 'listo') {
          setFinalEvent(event);
          return;
        }
        setPhases((prev) => ({
          ...prev,
          [event.phase]: { status: event.status, message: event.message, detail: event.detail },
        }));
      },
      controller.signal,
    )
      .catch((err) => {
        if (controller.signal.aborted) return;
        setFatalError(err instanceof Error ? err.message : 'Error inesperado al compilar');
      })
      .finally(() => {
        if (!controller.signal.aborted) setRunning(false);
      });
  };

  useEffect(() => {
    if (open) start();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const succeeded = finalEvent?.status === 'ok';
  const failed = finalEvent?.status === 'error' || !!fatalError;
  const finished = succeeded || failed;

  const handleClose = () => {
    abortRef.current?.abort();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && !running && handleClose()}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-2xl overflow-hidden fade-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white text-sm flex items-center justify-center shrink-0">
            🛠
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[var(--text)]">Compilando programa</h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              {running
                ? 'Ejecutando el pipeline del compilador…'
                : succeeded
                  ? '¡Compilación completa!'
                  : failed
                    ? 'La compilación falló'
                    : ''}
            </p>
          </div>
        </div>

        {/* Fases */}
        <div className="px-5 py-4 flex flex-col gap-3 max-h-[55vh] overflow-y-auto">
          {PHASES.map(({ key, label, icon }) => {
            const state = phases[key];
            return (
              <div key={key} className="flex gap-3">
                <div className="w-5 shrink-0 flex justify-center pt-0.5 text-sm">
                  <StatusIcon status={state.status} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{icon}</span>
                    <span
                      className={`text-xs font-semibold ${
                        state.status === 'pending' ? 'text-[var(--text-faint)]' : 'text-[var(--text)]'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {state.message && (
                    <p
                      className={`text-[11px] mt-0.5 ${
                        state.status === 'error'
                          ? 'text-[#ff9db2]'
                          : state.status === 'warning'
                            ? 'text-[#ffcb8a]'
                            : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {state.message}
                    </p>
                  )}
                  {(state.status === 'error' || state.status === 'warning') && (
                    <DetailList detail={state.detail} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Resultado final */}
        {(finished || fatalError) && (
          <div
            className={`px-5 py-3 border-t border-[var(--border)] text-xs ${
              succeeded ? 'bg-[#0f2318] text-[#8fe3b0]' : 'bg-[#2b1117] text-[#ff9db2]'
            }`}
          >
            {fatalError ?? finalEvent?.message}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border)] flex items-center justify-end gap-2">
          {failed && (
            <button
              onClick={start}
              className="px-3.5 h-9 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              ↻ Reintentar
            </button>
          )}
          <button
            onClick={handleClose}
            className="px-3.5 h-9 rounded-lg text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            {running ? 'Cancelar' : 'Cerrar'}
          </button>
          {succeeded && finalEvent?.buildId && (
            <a
              href={downloadBuildUrl(finalEvent.buildId)}
              className="inline-flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:opacity-85 active:scale-[0.97] transition"
            >
              ⬇ Descargar {finalEvent.fileName ?? 'ejecutable'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
