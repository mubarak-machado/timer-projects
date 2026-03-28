import { useTimerStore } from "@/store/timer";
import { useProjects } from "@/hooks/useProjects";
import { formatDuration, getElapsedSeconds } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ActiveTimerBannerProps {
  onClick: () => void;
}

export function ActiveTimerBanner({ onClick }: ActiveTimerBannerProps) {
  const activeSession = useTimerStore((s) => s.activeSession);
  const { getProject } = useProjects();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds(activeSession.inicio));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) return null;

  const project = getProject(activeSession.projetoId);

  return (
    <button
      onClick={onClick}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 py-3 px-4 min-h-[48px] bg-[--color-success] text-white font-medium text-lg"
      style={{ backgroundColor: "var(--color-success)" }}
    >
      <span className="animate-pulse flex-shrink-0">●</span>
      <span className="font-medium" style={{ wordBreak: "break-word" }}>{project?.nome ?? "Projeto"}</span>
      <span className="font-mono flex-shrink-0">{formatDuration(elapsed)}</span>
    </button>
  );
}