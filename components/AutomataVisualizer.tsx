'use client';

import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (!canvasRef.current || loading || states.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#13161e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#1f2435';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Calculate positions for states in a circle
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60;
    const stateRadius = 35;

    const statePositions: Record<string, { x: number; y: number }> = {};

    states.forEach((state, index) => {
      const angle = (index / states.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      statePositions[state.id] = { x, y };
    });

    // Draw transitions
    ctx.strokeStyle = '#3d4560';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#7a82a0';
    ctx.font = '12px var(--font-code), monospace';

    transitions.forEach((transition) => {
      const fromPos = statePositions[transition.from];
      const toPos = statePositions[transition.to];

      if (!fromPos || !toPos) return;

      if (transition.from === transition.to) {
        // Self loop
        const loopRadius = 30;
        ctx.beginPath();
        ctx.arc(
          fromPos.x + loopRadius,
          fromPos.y - loopRadius,
          loopRadius,
          0,
          2 * Math.PI
        );
        ctx.stroke();

        // Arrow
        const angle = Math.PI / 4;
        const arrowSize = 10;
        const arrowX = fromPos.x + loopRadius + loopRadius * Math.cos(angle);
        const arrowY = fromPos.y - loopRadius + loopRadius * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle - 0.5),
          arrowY - arrowSize * Math.sin(angle - 0.5)
        );
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle + 0.5),
          arrowY - arrowSize * Math.sin(angle + 0.5)
        );
        ctx.closePath();
        ctx.fill();

        // Label
        ctx.fillText(
          transition.label,
          fromPos.x + loopRadius + 10,
          fromPos.y - loopRadius - 20
        );
      } else {
        // Regular transition
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Draw arrow
        const startX = fromPos.x + stateRadius * Math.cos(angle);
        const startY = fromPos.y + stateRadius * Math.sin(angle);
        const endX = toPos.x - stateRadius * Math.cos(angle);
        const endY = toPos.y - stateRadius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrowhead
        const arrowSize = 10;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle - 0.3),
          endY - arrowSize * Math.sin(angle - 0.3)
        );
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle + 0.3),
          endY - arrowSize * Math.sin(angle + 0.3)
        );
        ctx.closePath();
        ctx.fill();

        // Label
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        ctx.fillStyle = '#0d0f14';
        ctx.fillRect(midX - 20, midY - 10, 40, 20);
        ctx.fillStyle = '#7a82a0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(transition.label, midX, midY);
      }
    });

    // Draw states
    states.forEach((state) => {
      const pos = statePositions[state.id];
      if (!pos) return;

      // Outer circle (for final states)
      if (state.isFinal) {
        ctx.strokeStyle = '#f55b5b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, stateRadius + 5, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // State circle
      ctx.fillStyle = '#1e2d56';
      ctx.strokeStyle = '#5b8af5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, stateRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Start arrow
      if (state.isStart) {
        ctx.strokeStyle = '#22d3a0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pos.x - stateRadius - 30, pos.y);
        ctx.lineTo(pos.x - stateRadius, pos.y);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = '#22d3a0';
        const angle = 0;
        ctx.beginPath();
        ctx.moveTo(pos.x - stateRadius, pos.y);
        ctx.lineTo(
          pos.x - stateRadius - 10 * Math.cos(-0.3),
          pos.y - 10 * Math.sin(-0.3)
        );
        ctx.lineTo(
          pos.x - stateRadius - 10 * Math.cos(0.3),
          pos.y - 10 * Math.sin(0.3)
        );
        ctx.closePath();
        ctx.fill();
      }

      // State label
      ctx.fillStyle = '#e8eaf2';
      ctx.font = 'bold 13px var(--font-code), monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.label, pos.x, pos.y);
    });
  }, [states, transitions, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full"></div>
          </div>
          <p className="mt-2 text-[var(--text-muted)]">Generando autómata...</p>
        </div>
      </div>
    );
  }

  if (states.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[var(--text-faint)]">Analiza un código para visualizar el autómata</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl h-full flex flex-col">
      <div className="px-4 py-2.5 border-b border-[var(--border)]">
        <h2 className="text-[11px] tracking-[0.14em] uppercase font-bold text-[var(--text-muted)]">Autómata de Estados Finitos</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
