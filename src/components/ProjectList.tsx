import { useProjects } from "@/hooks/useProjects";
import { useAreas } from "@/hooks/useAreas";
import { useSessions } from "@/hooks/useSessions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatDuration, formatCost, calculateCost } from "@/lib/utils";
import type { Contexto } from "@/types";

interface ProjectListProps {
  areaId: string;
  onBack: () => void;
  onSelectProject: (projectId: string) => void;
}

export function ProjectList({
  areaId,
  onBack,
  onSelectProject,
}: ProjectListProps) {
  const { getProjectsByArea, addProject } = useProjects();
  const { getArea } = useAreas();
  const { getTotalSecondsForProject } = useSessions();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#0a84ff");
  const [newTaxa, setNewTaxa] = useState("");
  const [newContexto] = useState<Contexto>("pessoal");

  const area = getArea(areaId);
  const projects = getProjectsByArea(areaId);

  const handleAdd = () => {
    if (newName.trim()) {
      addProject({
        area_id: areaId,
        nome: newName.trim(),
        cor: newColor,
        taxa_horaria: newTaxa ? parseFloat(newTaxa) : undefined,
        contexto: newContexto,
      });
      setNewName("");
      setNewTaxa("");
      setNewColor("#0a84ff");
      setIsAdding(false);
    }
  };

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
        <h1
          className="text-2xl font-bold"
          style={{ fontSize: "var(--font-size-xl)" }}
        >
          {area?.nome}
        </h1>
      </div>

      <div className="space-y-2">
        {projects.map((project) => {
          const totalSeconds = getTotalSecondsForProject(project.id);
          const cost = calculateCost(totalSeconds, project.taxa_horaria);
          return (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="w-full text-left p-4 border-b flex items-center gap-3"
              style={{
                borderColor: "var(--color-separator)",
                minHeight: "var(--min-touch-target)",
              }}
            >
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.cor }}
              />
              <div className="flex-1 min-w-0">
                <div
                  className="text-xl font-medium"
                  style={{
                    fontSize: "var(--font-size-lg)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {project.nome}
                </div>
                <div
                  className="text-base"
                  style={{
                    fontSize: "var(--font-size-meta)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {formatDuration(totalSeconds)}
                  {cost > 0 && ` • ${formatCost(cost)}`}
                </div>
              </div>
              <span
                className="text-lg"
                style={{ color: "var(--color-text-secondary)" }}
              >
                →
              </span>
            </button>
          );
        })}
      </div>

      {isAdding ? (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do projeto"
            className="w-full p-3 text-lg bg-[--color-surface] border rounded-lg"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-separator)",
              color: "var(--color-text-primary)",
            }}
            autoFocus
          />
          <div className="flex gap-3 items-center">
            <label className="text-base" style={{ color: "var(--color-text-secondary)" }}>
              Cor:
            </label>
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-12 h-12 rounded cursor-pointer"
            />
          </div>
          <div className="flex gap-3 items-center">
            <label className="text-base" style={{ color: "var(--color-text-secondary)" }}>
              Taxa horária (R$):
            </label>
            <input
              type="number"
              value={newTaxa}
              onChange={(e) => setNewTaxa(e.target.value)}
              placeholder="Opcional"
              className="flex-1 p-3 text-lg bg-[--color-surface] border rounded-lg"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-separator)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAdd} className="flex-1 h-12">
              Salvar
            </Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)} className="h-12">
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          className="mt-6 w-full h-14 text-lg"
          style={{ fontSize: "var(--font-size-lg)" }}
        >
          + Novo Projeto
        </Button>
      )}
    </div>
  );
}