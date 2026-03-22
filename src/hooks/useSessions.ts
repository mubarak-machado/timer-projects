import { useState, useCallback } from "react";
import type { Sessao } from "@/types";
import { getSessions, saveSessions, generateId } from "@/lib/storage";

export function useSessions() {
  const [sessions, setSessions] = useState<Sessao[]>(() => getSessions());

  const refresh = useCallback(() => {
    setSessions(getSessions());
  }, []);

  const addSession = useCallback(
    (data: {
      projeto_id: string;
      inicio: string;
      fim: string;
      nota?: string;
    }) => {
      const duracao_segundos = Math.floor(
        (new Date(data.fim).getTime() - new Date(data.inicio).getTime()) / 1000
      );
      const newSession: Sessao = {
        id: generateId(),
        projeto_id: data.projeto_id,
        inicio: data.inicio,
        fim: data.fim,
        duracao_segundos,
        nota: data.nota,
      };
      const updated = [...sessions, newSession];
      saveSessions(updated);
      setSessions(updated);
    },
    [sessions]
  );

  const deleteSession = useCallback(
    (id: string) => {
      const updated = sessions.filter((s) => s.id !== id);
      saveSessions(updated);
      setSessions(updated);
    },
    [sessions]
  );

  const getSessionsByProject = useCallback(
    (projectId: string) =>
      sessions
        .filter((s) => s.projeto_id === projectId)
        .sort(
          (a, b) =>
            new Date(b.inicio).getTime() - new Date(a.inicio).getTime()
        ),
    [sessions]
  );

  const getTotalSecondsForProject = useCallback(
    (projectId: string) =>
      sessions
        .filter((s) => s.projeto_id === projectId)
        .reduce((acc, s) => acc + s.duracao_segundos, 0),
    [sessions]
  );

  return { sessions, addSession, deleteSession, getSessionsByProject, getTotalSecondsForProject, refresh };
}