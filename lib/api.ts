import axios from 'axios';

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

interface BackendToken {
  type: string;
  value: string;
  line: number;
  col: number;
}

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeCode = async (source: string): Promise<AnalysisResponse> => {
  try {
    const response = await api.post<BackendToken[]>('/compiler/tokenize', {
      source,
    });

    return {
      tokens: response.data
        .filter((token) => token.type !== 'WS')
        .map((token) => ({
          lexema: token.value,
          tipo: token.type,
          linea: token.line,
          columna: token.col,
        })),
    };
  } catch (error) {
    console.error('Error analyzing code:', error);
    throw error;
  }
};

export default api;
