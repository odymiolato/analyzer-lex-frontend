'use client';

import React, { useEffect, useRef, useCallback } from 'react';

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

interface AutomataVisualizerProps {
  states?: State[];
  transitions?: Transition[];
  loading?: boolean;
}

export const AutomataVisualizer: React.FC<AutomataVisualizerProps> = ({
  states = [],
  transitions = [],
  loading = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || loading || states.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(rect.width, 320);
    const height = Math.max(rect.height, 280);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#13161e';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1f2435';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 60;
    const stateRadius = Math.min(35, radius / Math.max(states.length, 3));

    const statePositions: Record<string, { x: number; y: number }> = {};

    states.forEach((state, index) => {
      const angle = (index / states.length) * 2 * Math.PI - Math.PI / 2;
      statePositions[state.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    ctx.strokeStyle = '#3d4560';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#7a82a0';
    ctx.font = '11px var(--font-code), monospace';

    transitions.forEach((transition) => {
      const fromPos = statePositions[transition.from];
      const toPos = statePositions[transition.to];
      if (!fromPos || !toPos) return;

      if (transition.from === transition.to) {
        const loopRadius = 24;
        ctx.beginPath();
        ctx.arc(fromPos.x, fromPos.y - stateRadius - 10, loopRadius, 0, 2 * Math.PI);
        ctx.stroke();
        const label = transition.label.length > 8 ? transition.label.slice(0, 7) + '…' : transition.label;
        ctx.fillText(label, fromPos.x - 20, fromPos.y - stateRadius - 40);
      } else {
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const angle = Math.atan2(dy, dx);
        const startX = fromPos.x + stateRadius * Math.cos(angle);
        const startY = fromPos.y + stateRadius * Math.sin(angle);
        const endX = toPos.x - stateRadius * Math.cos(angle);
        const endY = toPos.y - stateRadius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        const arrowSize = 8;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - arrowSize * Math.cos(angle - 0.3), endY - arrowSize * Math.sin(angle - 0.3));
        ctx.lineTo(endX - arrowSize * Math.cos(angle + 0.3), endY - arrowSize * Math.sin(angle + 0.3));
        ctx.closePath();
        ctx.fill();

        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const label = transition.label.length > 10 ? transition.label.slice(0, 9) + '…' : transition.label;
        ctx.fillStyle = '#0d0f14';
        ctx.fillRect(midX - 28, midY - 8, 56, 16);
        ctx.fillStyle = '#7a82a0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, midX, midY);
      }
    });

    states.forEach((state) => {
      const pos = statePositions[state.id];
      if (!pos) return;

      if (state.isFinal) {
        ctx.strokeStyle = '#f55b5b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, stateRadius + 5, 0, 2 * Math.PI);
        ctx.stroke();
      }

      ctx.fillStyle = '#1e2d56';
      ctx.strokeStyle = '#5b8af5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, stateRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      if (state.isStart) {
        ctx.strokeStyle = '#22d3a0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pos.x - stateRadius - 24, pos.y);
        ctx.lineTo(pos.x - stateRadius, pos.y);
        ctx.stroke();
        ctx.fillStyle = '#22d3a0';
        ctx.beginPath();
        ctx.moveTo(pos.x - stateRadius, pos.y);
        ctx.lineTo(pos.x - stateRadius - 8, pos.y - 5);
        ctx.lineTo(pos.x - stateRadius - 8, pos.y + 5);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = '#e8eaf2';
      ctx.font = `bold ${Math.min(12, stateRadius * 0.35 + 8)}px var(--font-code), monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = state.label.length > 12 ? state.label.slice(0, 10) + '…' : state.label;
      ctx.fillText(label, pos.x, pos.y);
    });
  }, [states, transitions, loading]);

  useEffect(() => {
    draw();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => draw());
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[280px]">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full" />
          </div>
          <p className="mt-2 text-[var(--text-muted)] text-sm">Generando autómata...</p>
        </div>
      </div>
    );
  }

  if (states.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[280px]">
        <p className="text-[var(--text-faint)] text-sm text-center px-4">
          Analiza un código para visualizar el autómata
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl h-full min-h-[320px] flex flex-col">
      <div className="px-4 py-2.5 border-b border-[var(--border)] shrink-0">
        <h2 className="text-[11px] tracking-[0.14em] uppercase font-bold text-[var(--text-muted)]">
          Autómata de Estados Finitos
        </h2>
      </div>
      <div ref={containerRef} className="flex-1 min-h-[280px] relative">
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
    </div>
  );
};
