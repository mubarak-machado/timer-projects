export type Contexto = "pessoal" | "profissional" | "cliente";

export interface Area {
  id: string;
  nome: string;
  ordem: number;
  criado_em: string;
}

export interface Projeto {
  id: string;
  area_id: string;
  nome: string;
  cor: string;
  taxa_horaria?: number;
  contexto: Contexto;
  cliente_id?: string;
  criado_em: string;
}

export interface Sessao {
  id: string;
  projeto_id: string;
  inicio: string;
  fim?: string;
  duracao_segundos: number;
  nota?: string;
}