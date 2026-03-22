import { useProjects } from "@/hooks/useProjects";
import { useSessions } from "@/hooks/useSessions";
import { useTimerStore } from "@/store/timer";
import { Button } from "@/components/ui/button";
import {
  formatDuration,
  formatCost,
  calculateCost,
  formatDate,
  formatTime,
  getElapsedSeconds,
} from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const { getProject } = useProjects();
  const { getSessionsByProject, getTotalSecondsForProject, addSession } =
    useSessions();
  const activeSession = useTimerStore((s) => s.activeSession);
  const startTimer = useTimerStore((s) => s.startTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const [elapsed, setElapsed] = useState(0);

  const project = getProject(projectId);
  const sessions = getSessionsByProject(projectId);
  const totalSeconds = getTotalSecondsForProject(projectId);

  const isTimerRunning = activeSession?.projetoId === projectId;

  useEffect(() => {
    if (!activeSession || activeSession.projetoId !== projectId) return;
    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds(activeSession.inicio));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, projectId]);

  if (!project) return null;

  const handleStartTimer = () => {
    if (activeSession && activeSession.projetoId !== projectId) {
      const confirmed = window.confirm(
        `Há um timer ativo em outro projeto. Deseja parar o timer atual e iniciar neste?`
      );
      if (!confirmed) return;
      const stopped = stopTimer();
      if (stopped) {
        addSession({
          projeto_id: stopped.projetoId,
          inicio: stopped.inicio.toISOString(),
          fim: stopped.fim.toISOString(),
        });
      }
    }
    startTimer(projectId);
  };

  const handleStopTimer = () => {
    const stopped = stopTimer();
    if (stopped) {
      addSession({
        projeto_id: stopped.projetoId,
        inicio: stopped.inicio.toISOString(),
        fim: stopped.fim.toISOString(),
      });
    }
  };

  const cost = calculateCost(totalSeconds, project.taxa_horaria);
  const sessionCost = calculateCost(
    isTimerRunning ? elapsed : 0,
    project.taxa_horaria
  );

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-2xl h-12 flex items-center"
          aria-label="Voltar"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1
            className="text-xl font-bold truncate"
            style={{ fontSize: "var(--font-size-lg)" }}
          >
            {project.nome}
          </h1>
        </div>
      </div>

      {/* Timer Section */}
      <div
        className="rounded-xl p-6 mb-6 text-center"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div
          className="font-mono font-bold mb-2"
          style={{
            fontSize: "var(--font-size-timer)",
            color: isTimerRunning
              ? "var(--color-success)"
              : "var(--color-text-primary)",
          }}
        >
          {formatDuration(isTimerRunning ? elapsed : 0)}
        </div>

        {isTimerRunning && project.taxa_horaria && (
          <div
            className="text-2xl mb-4"
            style={{ fontSize: "var(--font-size-cost)", color: "var(--color-success)" }}
          >
            {formatCost(sessionCost)}
          </div>
        )}

        {isTimerRunning ? (
          <Button
            onClick={handleStopTimer}
            className="w-full h-16 text-xl font-bold"
            style={{
              backgroundColor: "var(--color-danger)",
              fontSize: "var(--font-size-lg)",
            }}
          >
            ■ Parar e Salvar
          </Button>
        ) : (
          <Button
            onClick={handleStartTimer}
            className="w-full h-16 text-xl font-bold"
            style={{
              backgroundColor: "var(--color-success)",
              fontSize: "var(--font-size-lg)",
            }}
          >
            ▶ Iniciar Timer
          </Button>
        )}
      </div>

      {/* Project Stats */}
      <div
        className="rounded-xl p-4 mb-6 flex justify-between items-center"
        style={{ backgroundColor: "var(--color-surface-2)" }}
      >
        <div>
          <div
            className="text-sm mb-1"
            style={{
              fontSize: "var(--font-size-meta)",
              color: "var(--color-text-secondary)",
            }}
          >
            Total acumulado
          </div>
          <div
            className="text-2xl font-bold"
            style={{ fontSize: "var(--font-size-cost)", color: "var(--color-text-primary)" }}
          >
            {formatDuration(totalSeconds)}
          </div>
        </div>
        {cost > 0 && (
          <div className="text-right">
            <div
              className="text-sm mb-1"
              style={{
                fontSize: "var(--font-size-meta)",
                color: "var(--color-text-secondary)",
              }}
            >
              Custo total
            </div>
            <div
              className="text-2xl font-bold"
              style={{ fontSize: "var(--font-size-cost)", color: "var(--color-accent)" }}
            >
              {formatCost(cost)}
            </div>
          </div>
        )}
      </div>

      {/* Session History */}
      <h2
        className="text-lg font-bold mb-3"
        style={{ fontSize: "var(--font-size-lg)" }}
      >
        Histórico
      </h2>
      <div className="space-y-2">
        {sessions.length === 0 ? (
          <p style={{ color: "var(--color-text-secondary)" }}>
            Nenhuma sessão registrada.
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <div
                className="flex justify-between items-center mb-1"
                style={{ fontSize: "var(--font-size-meta)" }}
              >
                <span style={{ color: "var(--color-text-secondary)" }}>
                  {formatDate(new Date(session.inicio))}
                </span>
                <span
                  className="font-mono font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {formatDuration(session.duracao_segundos)}
                </span>
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {formatTime(new Date(session.inicio))} →{" "}
                {session.fim ? formatTime(new Date(session.fim)) : "—"}
              </div>
              {session.nota && (
                <div
                  className="mt-2 text-base"
                  style={{
                    color: "var(--color-text-primary)",
                    fontSize: "var(--font-size-base)",
                  }}
                >
                  {session.nota}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}