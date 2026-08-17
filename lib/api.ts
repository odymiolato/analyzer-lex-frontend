import axios from 'axios';

// ─── Tipos existentes ─────────────────────────────────────

export interface Token {
  lexema: string;
  tipo: string;
  linea: number;
  columna: number;
}

export interface AnalysisResponse {
  tokens: Token[];
  automate?: {
    states: string[];
    transitions: Array<{
      from: string;
      to: string;
      label: string;
    }>;
  };
}

// ─── Tipos nuevos (análisis sintáctico) ───────────────────

export interface CSTNode {
  name: string;
  image?: string;
  tokenType?: string;
  children?: CSTNode[];
}

export interface SyntaxError {
  message: string;
  line: number;
  column: number;
  token: string;
}

export interface ParseResponse {
  cst: CSTNode | null;
  errors: SyntaxError[];
}

// ─── Tipos internos del backend ───────────────────────────

interface BackendToken {
  type: string;
  value: string;
  line: number;
  col: number;
}

// ─── Cliente axios ────────────────────────────────────────

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Análisis léxico (sin cambios) ────────────────────────

export const analyzeCode = async (source: string): Promise<AnalysisResponse> => {
  try {
    const response = await api.post<{ tokens: BackendToken[] }>('/compiler/tokenize', { code: source });

    return {
      tokens: response.data.tokens
        .filter((token) => token.type !== 'WS')
        .map((token) => ({
          lexema: token.value,
          tipo:   token.type,
          linea:  token.line,
          columna: token.col,
        })),
    };
  } catch (error) {
    console.error('Error analyzing code:', error);
    throw error;
  }
};

// ─── Análisis sintáctico ──────────────────────────────────

export const parseCode = async (source: string): Promise<ParseResponse> => {
  try {
    const response = await api.post<ParseResponse>('/compiler/parse', { code: source });
    return response.data;
  } catch (error) {
    console.error('Error parsing code:', error);
    throw error;
  }
};

// ─── Tipos semánticos ─────────────────────────────────────

export interface SemanticError {
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
}

export interface SymbolEntry {
  name: string;
  type: string;
  kind: string;
  scopeLevel: number;
  line: number;
  column: number;
  initialized: boolean;
  used: boolean;
}

export interface SemanticResponse {
  syntaxErrors: SyntaxError[];
  semantic: {
    errors: SemanticError[];
    warnings: SemanticError[];
    symbolTable: SymbolEntry[];
  };
}

// ─── Análisis semántico ───────────────────────────────────

export const analyzeSemantic = async (source: string): Promise<SemanticResponse> => {
  try {
    const response = await api.post<SemanticResponse>('/compiler/analyze', { code: source });
    return response.data;
  } catch (error) {
    console.error('Error in semantic analysis:', error);
    throw error;
  }
};

// ─── Traducción de código ─────────────────────────────────

export type TargetLanguage = 'javascript' | 'cpp';

export interface TranslateResponse {
  code: string;
  target: TargetLanguage;
  warnings: string[];
  syntaxErrors?: SyntaxError[];
}

export const translateCode = async (
  source: string,
  target: TargetLanguage,
): Promise<TranslateResponse> => {
  try {
    const response = await api.post<TranslateResponse>('/compiler/translate', {
      code: source,
      target,
    });
    return response.data;
  } catch (error) {
    console.error('Error translating code:', error);
    throw error;
  }
};

// ─── Código destino (TAC) y optimizador ───────────────────

export interface Quad {
  op: string;
  arg1: string | null;
  arg2: string | null;
  result: string | null;
}

export interface TACFunction {
  name: string;
  params: string[];
  code: Quad[];
}

export interface TACProgram {
  globals: Quad[];
  functions: TACFunction[];
}

export interface TargetCodeResponse {
  syntaxErrors: SyntaxError[];
  program: TACProgram;
  listing: string;
}

export const generateTargetCode = async (source: string): Promise<TargetCodeResponse> => {
  try {
    const response = await api.post<TargetCodeResponse>('/compiler/codegen', { code: source });
    return response.data;
  } catch (error) {
    console.error('Error generating target code:', error);
    throw error;
  }
};

export interface AppliedOptimization {
  pass: string;
  description: string;
}

export interface OptimizeStats {
  instructionsBefore: number;
  instructionsAfter: number;
  removed: number;
}

export interface OptimizeResponse {
  syntaxErrors: SyntaxError[];
  original: { program: TACProgram; listing: string };
  optimized: { program: TACProgram; listing: string };
  applied: AppliedOptimization[];
  stats: OptimizeStats;
}

export const optimizeCode = async (source: string): Promise<OptimizeResponse> => {
  try {
    const response = await api.post<OptimizeResponse>('/compiler/optimize', { code: source });
    return response.data;
  } catch (error) {
    console.error('Error optimizing code:', error);
    throw error;
  }
};

// ─── Compilación completa (pipeline → ejecutable) ─────────

export type BuildPhase =
  | 'lexico'
  | 'sintactico'
  | 'semantico'
  | 'codigo_intermedio'
  | 'optimizacion'
  | 'generacion_codigo'
  | 'ensamblado_enlace'
  | 'listo';

export type BuildStatus = 'running' | 'ok' | 'warning' | 'error';

export interface BuildEvent {
  phase: BuildPhase;
  status: BuildStatus;
  message: string;
  detail?: unknown;
  buildId?: string;
  fileName?: string;
}

/**
 * Lanza la compilación completa (léxico → … → ejecutable) y va entregando
 * cada evento de fase a medida que el backend los transmite (NDJSON).
 */
export const streamBuild = async (
  source: string,
  onEvent: (event: BuildEvent) => void,
  signal?: AbortSignal,
): Promise<void> => {
  const response = await fetch('/api/compiler/build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: source }),
    signal,
  });

  if (!response.ok) {
    let message = 'Error al iniciar la compilación';
    try {
      const data = await response.json();
      message = data?.message ?? message;
    } catch {
      // la respuesta no era JSON
    }
    throw new Error(message);
  }
  if (!response.body) {
    throw new Error('El servidor no devolvió una respuesta válida');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const consumeLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      onEvent(JSON.parse(trimmed) as BuildEvent);
    } catch {
      // línea parcial o corrupta — se ignora
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
      consumeLine(buffer.slice(0, newlineIndex));
      buffer = buffer.slice(newlineIndex + 1);
    }
  }
  consumeLine(buffer);
};

/** URL de descarga del ejecutable generado por un build exitoso. */
export const downloadBuildUrl = (buildId: string): string =>
  `/api/compiler/build/${buildId}/download`;

export default api;