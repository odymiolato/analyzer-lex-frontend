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

// ─── Análisis sintáctico (nuevo) ──────────────────────────

export const parseCode = async (source: string): Promise<ParseResponse> => {
  try {
    const response = await api.post<ParseResponse>('/compiler/parse', { code: source });
    return response.data;
  } catch (error) {
    console.error('Error parsing code:', error);
    throw error;
  }
};

export default api;