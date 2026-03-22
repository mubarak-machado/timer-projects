import type { Sessao, Projeto } from "@/types";
import { formatDate, formatTime, formatDuration, formatCost, calculateCost } from "./utils";

export function exportProjectSessionsToCSV(
  project: Projeto,
  sessions: Sessao[]
): string {
  const headers = ["Data", "Início", "Fim", "Duração", "Custo", "Nota"];
  const rows = sessions.map((s) => {
    const cost = calculateCost(s.duracao_segundos, project.taxa_horaria);
    return [
      formatDate(new Date(s.inicio)),
      formatTime(new Date(s.inicio)),
      s.fim ? formatTime(new Date(s.fim)) : "",
      formatDuration(s.duracao_segundos),
      cost > 0 ? formatCost(cost) : "",
      s.nota ? `"${s.nota.replace(/"/g, '""')}"` : "",
    ];
  });

  const totalSeconds = sessions.reduce((acc, s) => acc + s.duracao_segundos, 0);
  const totalCost = calculateCost(totalSeconds, project.taxa_horaria);
  const totalRow = [
    "TOTAL",
    "",
    "",
    formatDuration(totalSeconds),
    totalCost > 0 ? formatCost(totalCost) : "",
    "",
  ];

  const csvContent = [
    `Projeto: ${project.nome}`,
    `Taxa Horária: ${project.taxa_horaria ? formatCost(project.taxa_horaria) + "/h" : "Não definida"}`,
    "",
    headers.join(","),
    ...rows.map((r) => r.join(",")),
    totalRow.join(","),
  ].join("\n");

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}