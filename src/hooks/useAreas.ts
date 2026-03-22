import { useState, useCallback } from "react";
import type { Area } from "@/types";
import { getAreas, saveAreas, generateId } from "@/lib/storage";

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>(() => getAreas());

  const refresh = useCallback(() => {
    setAreas(getAreas());
  }, []);

  const addArea = useCallback(
    (nome: string) => {
      const newArea: Area = {
        id: generateId(),
        nome,
        ordem: areas.length,
        criado_em: new Date().toISOString(),
      };
      const updated = [...areas, newArea];
      saveAreas(updated);
      setAreas(updated);
    },
    [areas]
  );

  const updateArea = useCallback(
    (id: string, nome: string) => {
      const updated = areas.map((a) => (a.id === id ? { ...a, nome } : a));
      saveAreas(updated);
      setAreas(updated);
    },
    [areas]
  );

  const deleteArea = useCallback(
    (id: string) => {
      const updated = areas.filter((a) => a.id !== id);
      saveAreas(updated);
      setAreas(updated);
    },
    [areas]
  );

  const getArea = useCallback(
    (id: string) => areas.find((a) => a.id === id),
    [areas]
  );

  return { areas, addArea, updateArea, deleteArea, getArea, refresh };
}