'use client';

import React, { useState } from 'react';

const KEYWORDS = [
  'if', 'else', 'while', 'for', 'do', 'switch', 'case', 'default',
  'break', 'continue', 'return', 'goto', 'sizeof',
];

const TYPES = [
  'int', 'float', 'double', 'char', 'void', 'short', 'long',
  'signed', 'unsigned', 'struct', 'union', 'enum', 'typedef',
  'const', 'volatile', 'static', 'extern', 'register', 'auto',
];

const OPERATORS = [
  '+', '-', '*', '/', '%', '++', '--',
  '==', '!=', '<', '>', '<=', '>=',
  '&&', '||', '!', '&', '|', '^', '~',
  '<<', '>>', '+=', '-=', '*=', '/=', '%=',
  '&=', '|=', '^=', '<<=', '>>=',
  '=', '->', '.', '?', ':',
];

const BUILTINS = [
  'printf', 'scanf', 'malloc', 'free', 'calloc', 'realloc',
  'strlen', 'strcpy', 'strcmp', 'NULL',
];

type DocSection = 'overview' | 'tokens' | 'grammar' | 'types' | 'operators' | 'usage';

const NAV: { id: DocSection; label: string }[] = [
  { id: 'overview', label: 'Introducción' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'grammar', label: 'Gramática' },
  { id: 'types', label: 'Tipos' },
  { id: 'operators', label: 'Operadores' },
  { id: 'usage', label: 'Uso' },
];

function TagList({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <code
          key={item}
          className={`px-2 py-0.5 rounded text-xs code-font border ${color}`}
        >
          {item}
        </code>
      ))}
    </div>
  );
}

export const Documentation: React.FC = () => {
  const [section, setSection] = useState<DocSection>('overview');

  return (
    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border)] h-full overflow-auto">
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text)] mb-2 tracking-tight">
          Documentación del Lenguaje C
        </h1>
        <p className="text-[var(--text-muted)] text-sm md:text-base mb-6">
          Especificación completa del subconjunto de C soportado por el analizador léxico, sintáctico y semántico.
        </p>

        {/* Section nav */}
        <nav className="flex flex-wrap gap-1.5 mb-8 pb-4 border-b border-[var(--border)]">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                section === id
                  ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]'
                  : 'text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {section === 'overview' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">¿Qué es este lenguaje?</h2>
              <p className="text-[var(--text-muted)] leading-relaxed mb-3">
                El analizador implementa un <strong className="text-[var(--text)]">subconjunto de C (Mini-C)</strong> con
                soporte para declaraciones de variables, funciones, estructuras de control, expresiones aritméticas y
                lógicas, llamadas a funciones y directivas de preprocesador básicas.
              </p>
              <p className="text-[var(--text-muted)] leading-relaxed">
                El pipeline de compilación consta de tres fases: <strong className="text-[var(--accent)]">análisis léxico</strong> (tokenización con Moo),
                <strong className="text-[var(--accent)]"> análisis sintáctico</strong> (parser recursivo-descendente → CST)
                y <strong className="text-[var(--accent)]">análisis semántico</strong> (tabla de símbolos y verificación de tipos).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Palabras reservadas</h2>
              <TagList
                items={KEYWORDS}
                color="bg-[#1e1056] text-[#a78bfa] border-[#3d2a9e]"
              />
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Funciones built-in reconocidas</h2>
              <TagList
                items={BUILTINS}
                color="bg-[#0c2b1f] text-[#34d399] border-[#065f46]"
              />
            </section>
          </div>
        )}

        {section === 'tokens' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Clasificación de tokens</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {[
                  { name: 'KEYWORD', desc: 'Palabras reservadas del lenguaje (if, while, return…)', cls: 'bg-[#1e1056] border-[#3d2a9e] text-[#a78bfa]' },
                  { name: 'TYPE', desc: 'Tipos de datos y modificadores (int, float, const…)', cls: 'bg-[#11001f] border-[#581c87] text-[#c084fc]' },
                  { name: 'IDENTIFIER', desc: 'Nombres de variables, funciones y parámetros', cls: 'bg-[#0c2b1f] border-[#065f46] text-[#34d399]' },
                  { name: 'NUMBER', desc: 'Enteros y flotantes (3.14, 1e5)', cls: 'bg-[#1c1000] border-[#78350f] text-[#fbbf24]' },
                  { name: 'STRING', desc: 'Cadenas entre comillas dobles', cls: 'bg-[#2d0e1a] border-[#831843] text-[#f472b6]' },
                  { name: 'CHAR', desc: 'Caracteres entre comillas simples', cls: 'bg-[#2d0e1a] border-[#831843] text-[#f472b6]' },
                  { name: 'OPERATOR', desc: 'Operadores aritméticos, lógicos y de asignación', cls: 'bg-[#001526] border-[#075985] text-[#38bdf8]' },
                  { name: 'PUNCTUATION', desc: 'Paréntesis, llaves, corchetes, punto y coma', cls: 'bg-[#181818] border-[#334155] text-[#94a3b8]' },
                  { name: 'BOOLEAN', desc: 'Literales true y false', cls: 'bg-[#1a0a00] border-[#7c2d12] text-[#fb923c]' },
                  { name: 'COMMENT', desc: 'Comentarios // y /* */ (ignorados en parsing)', cls: 'bg-[#0a1a0a] border-[#1f2937] text-[#6b7280]' },
                  { name: 'PREPROCESSOR', desc: 'Directivas #include, #define (filtradas)', cls: 'bg-[#1a1a2e] border-[#3730a3] text-[#818cf8]' },
                ].map((t) => (
                  <div key={t.name} className={`p-4 rounded-lg border ${t.cls}`}>
                    <h3 className="font-semibold mb-1">{t.name}</h3>
                    <p className="text-sm opacity-80">{t.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Reglas léxicas</h2>
              <ul className="space-y-2 text-[var(--text-muted)] text-sm">
                <li>• Identificadores: <code className="code-font text-[var(--accent)]">[a-zA-Z_][a-zA-Z0-9_]*</code></li>
                <li>• Números: enteros, flotantes y notación científica</li>
                <li>• Strings con secuencias de escape: <code className="code-font">\n</code>, <code className="code-font">\t</code>, etc.</li>
                <li>• Comentarios de línea (<code className="code-font">//</code>) y bloque (<code className="code-font">/* */</code>)</li>
              </ul>
            </section>
          </div>
        )}

        {section === 'grammar' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Gramática BNF (subconjunto)</h2>
              <div className="bg-[var(--bg)] p-4 md:p-5 rounded-lg border border-[var(--border)] code-font text-xs md:text-sm overflow-x-auto">
                <pre className="text-[var(--text-muted)] leading-relaxed whitespace-pre">{`program        → statement*
statement      → block | ifStmt | whileStmt | doWhileStmt | forStmt
               | switchStmt | returnStmt | breakStmt | continueStmt
               | varDecl | funcDef | exprStmt

block          → '{' statement* '}'
varDecl        → typeSpec identifier ('[' expr ']')? ('=' expr)? (',' identifier ...)? ';'
funcDef        → typeSpec identifier '(' paramList ')' block
paramList      → param (',' param)* | ε | '...'
param          → typeSpec identifier?

ifStmt         → 'if' '(' expr ')' block ('else' (ifStmt | block))?
whileStmt      → 'while' '(' expr ')' block
doWhileStmt    → 'do' block 'while' '(' expr ')' ';'
forStmt        → 'for' '(' (varDecl | exprStmt | ε) expr? ';' expr? ')' block
returnStmt     → 'return' expr? ';'
switchStmt     → 'switch' '(' expr ')' '{' caseClause* defaultClause? '}'

expr           → assignment
assignment     → ternary ('=' | '+=' | '-=' | ...) assignment?
ternary        → logicalOr ('?' expr ':' expr)?
logicalOr      → logicalAnd ('||' logicalAnd)*
logicalAnd     → bitwiseOr ('&&' bitwiseOr)*
...            → additive, multiplicative, unary, postfix, primary
primary        → NUMBER | STRING | CHAR | BOOLEAN | IDENTIFIER
               | '(' expr ')' | sizeof '(' type | expr ')'`}
                </pre>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Nodos del árbol sintáctico (CST)</h2>
              <p className="text-[var(--text-muted)] text-sm mb-3">
                El parser genera un árbol de sintaxis concreta con nodos como:
              </p>
              <TagList
                items={[
                  'program', 'functionDefinition', 'variableDeclaration', 'block',
                  'ifStatement', 'whileStatement', 'forStatement', 'switchStatement',
                  'returnStatement', 'binaryExpr', 'unaryExpr', 'callExpr',
                  'arrayAccess', 'memberAccess', 'castExpr', 'assignment',
                ]}
                color="bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)]"
              />
            </section>
          </div>
        )}

        {section === 'types' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Tipos primitivos</h2>
              <div className="overflow-x-auto table-scroll">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                      <th className="py-2 px-3 text-left">Tipo</th>
                      <th className="py-2 px-3 text-left">Descripción</th>
                      <th className="py-2 px-3 text-left">Ejemplo</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--text-muted)]">
                    {[
                      ['int', 'Entero de 32 bits', 'int x = 42;'],
                      ['float', 'Número flotante', 'float pi = 3.14;'],
                      ['double', 'Doble precisión', 'double e = 2.718;'],
                      ['char', 'Carácter / byte', 'char c = \'A\';'],
                      ['void', 'Sin valor (funciones)', 'void foo() {}'],
                      ['short / long', 'Enteros de distinto tamaño', 'long n = 1000;'],
                    ].map(([type, desc, ex]) => (
                      <tr key={type} className="border-b border-[var(--border)]">
                        <td className="py-2 px-3 code-font text-[var(--accent)]">{type}</td>
                        <td className="py-2 px-3">{desc}</td>
                        <td className="py-2 px-3 code-font text-xs">{ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Modificadores de tipo</h2>
              <TagList
                items={TYPES.filter((t) => !['int', 'float', 'double', 'char', 'void', 'short', 'long'].includes(t))}
                color="bg-[#11001f] text-[#c084fc] border-[#581c87]"
              />
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Verificación semántica</h2>
              <ul className="space-y-2 text-[var(--text-muted)] text-sm">
                <li>• Tabla de símbolos con ámbitos anidados (global, función, bloque, for)</li>
                <li>• Detección de variables no declaradas y redeclaraciones</li>
                <li>• Compatibilidad de tipos en asignaciones y operaciones</li>
                <li>• Validación de return en funciones void / no-void</li>
                <li>• break/continue fuera de contexto de bucle</li>
                <li>• Variables y parámetros no utilizados (warning)</li>
              </ul>
            </section>
          </div>
        )}

        {section === 'operators' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Operadores soportados</h2>
              <TagList
                items={OPERATORS}
                color="bg-[#001526] text-[#38bdf8] border-[#075985]"
              />
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Precedencia (mayor → menor)</h2>
              <ol className="space-y-1.5 text-sm text-[var(--text-muted)] list-decimal list-inside">
                <li>Postfijo: <code className="code-font">++</code>, <code className="code-font">--</code>, <code className="code-font">()</code>, <code className="code-font">[]</code>, <code className="code-font">.</code>, <code className="code-font">-&gt;</code></li>
                <li>Prefijo: <code className="code-font">++</code>, <code className="code-font">--</code>, <code className="code-font">!</code>, <code className="code-font">~</code>, <code className="code-font">+</code>, <code className="code-font">-</code>, cast</li>
                <li>Multiplicativos: <code className="code-font">*</code>, <code className="code-font">/</code>, <code className="code-font">%</code></li>
                <li>Aditivos: <code className="code-font">+</code>, <code className="code-font">-</code></li>
                <li>Shift: <code className="code-font">&lt;&lt;</code>, <code className="code-font">&gt;&gt;</code></li>
                <li>Relacionales: <code className="code-font">&lt;</code>, <code className="code-font">&gt;</code>, <code className="code-font">&lt;=</code>, <code className="code-font">&gt;=</code></li>
                <li>Igualdad: <code className="code-font">==</code>, <code className="code-font">!=</code></li>
                <li>Bitwise: <code className="code-font">&amp;</code>, <code className="code-font">^</code>, <code className="code-font">|</code></li>
                <li>Lógicos: <code className="code-font">&amp;&amp;</code>, <code className="code-font">||</code></li>
                <li>Ternario: <code className="code-font">?:</code></li>
                <li>Asignación: <code className="code-font">=</code>, <code className="code-font">+=</code>, …</li>
              </ol>
            </section>
          </div>
        )}

        {section === 'usage' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Cómo usar el analizador</h2>
              <ol className="space-y-3 text-[var(--text-muted)] text-sm">
                <li className="flex gap-3"><span className="font-bold text-[var(--accent)] shrink-0">1.</span><span>Escribe código C en la pestaña <strong>Léxico</strong></span></li>
                <li className="flex gap-3"><span className="font-bold text-[var(--accent)] shrink-0">2.</span><span>Pulsa <strong>Analizar</strong> para tokenizar, parsear y analizar semánticamente</span></li>
                <li className="flex gap-3"><span className="font-bold text-[var(--accent)] shrink-0">3.</span><span>Revisa tokens, árbol CST, errores y tabla de símbolos en cada pestaña</span></li>
                <li className="flex gap-3"><span className="font-bold text-[var(--accent)] shrink-0">4.</span><span>Usa <strong>Traductor</strong> para convertir C válido a JavaScript o C++</span></li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--text)] mb-3">Ejemplo completo</h2>
              <div className="bg-[var(--bg)] p-4 rounded-lg border border-[var(--border)] code-font text-xs md:text-sm overflow-x-auto">
                <pre className="text-[var(--text-muted)]">{`int factorial(int n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

int main() {
  int result = factorial(5);
  printf("%d", result);
  return 0;
}`}</pre>
              </div>
            </section>

            <section className="bg-[#111b35] border border-[#284083] rounded-lg p-5">
              <h3 className="text-base font-semibold text-[#8db2ff] mb-2">Traductor de código</h3>
              <p className="text-[#b8caff] text-sm">
                El traductor convierte programas C sintácticamente válidos a <strong>JavaScript</strong> (console.log, let, function)
                o <strong>C++</strong> (iostream, cout). Las funciones printf se transforman automáticamente según el destino.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
