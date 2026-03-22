import { useState, useCallback } from "react";
import type { Projeto, Contexto } from "@/types";
import { getProjects, saveProjects, generateId } from "@/lib/storage";

export function useProjects() {
  const [projects, setProjects] = useState<Projeto[]>(() => getProjects());

  const refresh = useCallback(() => {
    setProjects(getProjects());
  }, []);

  const addProject = useCallback(
    (data: {
      area_id: string;
      nome: string;
      cor: string;
      taxa_horaria?: number;
      contexto: Contexto;
    }) => {
      const newProject: Projeto = {
        id: generateId(),
        ...data,
        criado_em: new Date().toISOString(),
      };
      const updated = [...projects, newProject];
      saveProjects(updated);
      setProjects(updated);
    },
    [projects]
  );

  const updateProject = useCallback(
    (id: string, data: Partial<Projeto>) => {
      const updated = projects.map((p) =>
        p.id === id ? { ...p, ...data } : p
      );
      saveProjects(updated);
      setProjects(updated);
    },
    [projects]
  );

  const deleteProject = useCallback(
    (id: string) => {
      const updated = projects.filter((p) => p.id !== id);
      saveProjects(updated);
      setProjects(updated);
    },
    [projects]
  );

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  const getProjectsByArea = useCallback(
    (areaId: string) => projects.filter((p) => p.area_id === areaId),
    [projects]
  );

  return { projects, addProject, updateProject, deleteProject, getProject, getProjectsByArea, refresh };
}