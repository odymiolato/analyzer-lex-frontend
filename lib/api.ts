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

export default api;