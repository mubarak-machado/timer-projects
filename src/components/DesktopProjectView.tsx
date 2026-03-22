import { useProjects } from "@/hooks/useProjects";
import { useSessions } from "@/hooks/useSessions";
import { useTimerStore } from "@/store/timer";
import { Button } from "@/components/ui/button";
import { ManualEntry } from "@/components/ManualEntry";
import {
  formatDuration,
  formatCost,
  calculateCost,
  formatDate,
  formatTime,
  getElapsedSeconds,
} from "@/lib/utils";
import { exportProjectSessionsToCSV, downloadCSV } from "@/lib/export";
import { useEffect, useState } from "react";

interface DesktopProjectViewProps {
  projectId: string;
}

export function DesktopProjectView({ projectId }: DesktopProjectViewProps) {
  const { getProject } = useProjects();
  const { getSessionsByProject, getTotalSecondsForProject, addSession } =
    useSessions();
  const activeSession = useTimerStore((s) => s.activeSession);
  const startTimer = useTimerStore((s) => s.startTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const [elapsed, setElapsed] = useState(0);
  const [showManualEntry, setShowManualEntry] = useState(false);

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

  if (showManualEntry) {
    return (
      <ManualEntry
        onCancel={() => setShowManualEntry(false)}
        onSave={(data) => {
          addSession({ projeto_id: projectId, ...data });
          setShowManualEntry(false);
        }}
      />
    );
  }

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

  const handleExportCSV = () => {
    const csv = exportProjectSessionsToCSV(project, sessions);
    const filename = `${project.nome.replace(/[^a-zA-Z0-9]/g, "_")}_historico.csv`;
    downloadCSV(csv, filename);
  };

  const cost = calculateCost(totalSeconds, project.taxa_horaria);
  const sessionCost = calculateCost(
    isTimerRunning ? elapsed : 0,
    project.taxa_horaria
  );

  return (
    <div className="flex flex-col h-full">
      {/* Timer Section - 50% top */}
      <div
        className="p-6 flex flex-col items-center justify-center border-b"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-separator)",
          minHeight: "50vh",
        }}
      >
        <h2
          className="mb-6 font-bold text-center"
          style={{
            fontSize: "var(--font-size-xl)",
            color: "var(--color-text-primary)",
          }}
        >
          {project.nome}
        </h2>

        <div
          className="font-mono font-bold mb-4"
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
            className="mb-6"
            style={{
              fontSize: "var(--font-size-cost)",
              color: "var(--color-success)",
            }}
          >
            {formatCost(sessionCost)}
          </div>
        )}

        <div className="flex gap-4 w-full max-w-md">
          {isTimerRunning ? (
            <Button
              onClick={handleStopTimer}
              className="flex-1 h-16 font-bold"
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
              className="flex-1 h-16 font-bold"
              style={{
                backgroundColor: "var(--color-success)",
                fontSize: "var(--font-size-lg)",
              }}
            >
              ▶ Iniciar Timer
            </Button>
          )}
        </div>

        <div className="flex gap-3 mt-4 w-full max-w-md">
          <Button
            variant="secondary"
            onClick={() => setShowManualEntry(true)}
            className="flex-1 h-12"
            style={{
              backgroundColor: "var(--color-surface-2)",
              color: "var(--color-text-primary)",
              fontSize: "var(--font-size-base)",
            }}
          >
            + Lançamento Manual
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            disabled={sessions.length === 0}
            className="flex-1 h-12"
            style={{
              backgroundColor: "var(--color-surface-2)",
              color:
                sessions.length === 0
                  ? "var(--color-text-secondary)"
                  : "var(--color-text-primary)",
              fontSize: "var(--font-size-base)",
            }}
          >
            Exportar CSV
          </Button>
        </div>

        {/* Stats row */}
        <div
          className="flex justify-between w-full max-w-md mt-6 p-4 rounded-lg"
          style={{ backgroundColor: "var(--color-surface-2)" }}
        >
          <div>
            <div
              className="mb-1"
              style={{
                fontSize: "var(--font-size-meta)",
                color: "var(--color-text-secondary)",
              }}
            >
              Total acumulado
            </div>
            <div
              className="font-bold"
              style={{
                fontSize: "var(--font-size-cost)",
                color: "var(--color-text-primary)",
              }}
            >
              {formatDuration(totalSeconds)}
            </div>
          </div>
          {cost > 0 && (
            <div className="text-right">
              <div
                className="mb-1"
                style={{
                  fontSize: "var(--font-size-meta)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Custo total
              </div>
              <div
                className="font-bold"
                style={{
                  fontSize: "var(--font-size-cost)",
                  color: "var(--color-accent)",
                }}
              >
                {formatCost(cost)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Section - 50% bottom */}
      <div className="flex-1 overflow-y-auto p-6">
        <h3
          className="mb-4 font-bold"
          style={{
            fontSize: "var(--font-size-lg)",
            color: "var(--color-text-primary)",
          }}
        >
          Histórico
        </h3>
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)" }}>
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
                    className="mt-2"
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
    </div>
  );
}