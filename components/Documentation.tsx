'use client';

import React from 'react';

export const Documentation: React.FC = () => {
  return (
    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border)] h-full overflow-auto">
      <div style={{ padding: 'calc(var(--spacing) * 6)' }} className="p-6 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[var(--text)] mb-6 tracking-tight">
          Analizador Léxico - Documentación
        </h1>

        <section style={{ marginBottom: 'calc(var(--spacing) * 8)' }} className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
            ¿Qué es un Analizador Léxico?
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed mb-4">
            Un analizador léxico (lexer) es un componente fundamental en compiladores e intérpretes
            que realiza el análisis léxico. Su función principal es transformar una secuencia de
            caracteres en una secuencia de tokens (palabras clave, identificadores, operadores, etc.).
          </p>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Este proceso es el primer paso en la compilación de un programa, donde se divide el
            código fuente en unidades significativas llamadas tokens.
          </p>
        </section>

        <section style={{ marginBottom: 'calc(var(--spacing) * 8)' }} className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
            Características principales
          </h2>
          <ul className="space-y-2 text-[var(--text-muted)]">
            <li className="flex items-start">
              <span className="text-[var(--accent)] mr-3 font-bold">•</span>
              <span>Reconocimiento de palabras clave (keywords)</span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--accent)] mr-3 font-bold">•</span>
              <span>Identificación de identificadores (variables, funciones)</span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--accent)] mr-3 font-bold">•</span>
              <span>Detección de números y cadenas de texto</span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--accent)] mr-3 font-bold">•</span>
              <span>Reconocimiento de operadores (+, -, *, /, ==, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--accent)] mr-3 font-bold">•</span>
              <span>Identificación de símbolos de puntuación</span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--accent)] mr-3 font-bold">•</span>
              <span>Eliminación de comentarios y espacios en blanco</span>
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: 'calc(var(--spacing) * 8)' }} className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
            Tipos de Tokens
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div style={{ padding: 'calc(var(--spacing) * 4)' }} className="bg-[#1e1056] p-4 rounded-lg border border-[#3d2a9e]">
              <h3 className="font-semibold text-[#a78bfa] mb-2">KEYWORD</h3>
              <p className="text-sm text-[#c4b5fd]">
                Palabras reservadas del lenguaje como int, if, while, for, etc.
              </p>
            </div>
            <div style={{ padding: 'calc(var(--spacing) * 4)' }} className="bg-[#0c2b1f] p-4 rounded-lg border border-[#065f46]">
              <h3 className="font-semibold text-[#34d399] mb-2">IDENTIFIER</h3>
              <p className="text-sm text-[#6ee7b7]">
                Nombres de variables, funciones y otras entidades definidas por el usuario.
              </p>
            </div>
            <div style={{ padding: 'calc(var(--spacing) * 4)' }} className="bg-[#1c1000] p-4 rounded-lg border border-[#78350f]">
              <h3 className="font-semibold text-[#fbbf24] mb-2">NUMBER</h3>
              <p className="text-sm text-[#fcd34d]">
                Constantes numéricas (enteros y números en punto flotante).
              </p>
            </div>
            <div style={{ padding: 'calc(var(--spacing) * 4)' }} className="bg-[#2d0e1a] p-4 rounded-lg border border-[#831843]">
              <h3 className="font-semibold text-[#f472b6] mb-2">STRING</h3>
              <p className="text-sm text-[#f9a8d4]">
                Cadenas de texto entre comillas simples o dobles.
              </p>
            </div>
            <div style={{ padding: 'calc(var(--spacing) * 4)' }} className="bg-[#001526] p-4 rounded-lg border border-[#075985]">
              <h3 className="font-semibold text-[#38bdf8] mb-2">OPERATOR</h3>
              <p className="text-sm text-[#7dd3fc]">
                Operadores aritméticos, relacionales y lógicos (+, -, ==, &&, etc.).
              </p>
            </div>
            <div style={{ padding: 'calc(var(--spacing) * 4)' }} className="bg-[#181818] p-4 rounded-lg border border-[#334155]">
              <h3 className="font-semibold text-[#94a3b8] mb-2">PUNCTUATION</h3>
              <p className="text-sm text-[#cbd5e1]">
                Símbolos de puntuación como paréntesis, llaves y punto y coma.
              </p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 'calc(var(--spacing) * 8)' }} className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
          Cómo usar esta herramienta
        </h2>
        <ol className="space-y-3 text-[var(--text-muted)]">
          <li className="flex gap-3">
            <span className="font-bold text-[var(--accent)] min-w-fit">Paso 1:</span>
            <span>Escribe o pega tu código en el editor de la izquierda</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-[var(--accent)] min-w-fit">Paso 2:</span>
            <span>Haz clic en el botón "Analizar"</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-[var(--accent)] min-w-fit">Paso 3:</span>
            <span>Observa los tokens reconocidos en la tabla</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-[var(--accent)] min-w-fit">Paso 4:</span>
            <span>Visualiza el autómata de estados finitos generado</span>
          </li>
        </ol>
      </section>

      <section style={{ marginBottom: 'calc(var(--spacing) * 8)' }} className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
          Autómata de Estados Finitos
        </h2>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          Un autómata de estados finitos (DFA) es un modelo computacional que consta de:
        </p>
        <ul className="space-y-2 text-[var(--text-muted)] mb-4">
          <li className="flex items-start">
            <span className="text-[var(--accent)] mr-3 font-bold">•</span>
            <span><strong>Estados:</strong> Círculos azules que representan diferentes configuraciones</span>
          </li>
          <li className="flex items-start">
            <span className="text-[var(--accent)] mr-3 font-bold">•</span>
            <span><strong>Transiciones:</strong> Flechas que muestran cómo se pasa de un estado a otro</span>
          </li>
          <li className="flex items-start">
            <span className="text-[var(--accent)] mr-3 font-bold">•</span>
            <span><strong>Estado inicial:</strong> Marcado con una flecha verde (→)</span>
          </li>
          <li className="flex items-start">
            <span className="text-[var(--accent)] mr-3 font-bold">•</span>
            <span><strong>Estados aceptadores:</strong> Marcados con doble círculo rojo</span>
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: 'calc(var(--spacing) * 8)' }} className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
          Ejemplo de uso
        </h2>
        <div className="bg-[var(--bg)] p-4 rounded-lg border border-[var(--border)] code-font text-sm mb-4">
          <pre className="text-[var(--text-muted)]">{`int main() {
  int x = 10;
  float pi = 3.14;
  return 0;
}`}</pre>
        </div>
        <p className="text-[var(--text-muted)] leading-relaxed">
          Este código generará tokens para: int (KEYWORD), main (IDENTIFIER), ( (PUNCTUATION),
          y así sucesivamente, mostrando claramente cómo se descompone en sus elementos básicos.
        </p>
      </section>

      <section style={{ marginBottom: 'calc(var(--spacing) * 8)' }} className="bg-[#111b35] border border-[#284083] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#8db2ff] mb-2">
          Tip: Tecnología utilizada
        </h3>
        <p className="text-[#b8caff]">
          Este analizador utiliza la librería <strong>Moo</strong> para tokenización,
          <strong> Chevrotain</strong> para análisis sintáctico y <strong>Next.js</strong> con
          <strong> shadcn/ui</strong> para la interfaz de usuario.
        </p>
      </section>
    </div>
    </div >
  );
};
