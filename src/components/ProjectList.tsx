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
  const { getProjectsByArea, addProject, updateProject, deleteProject } = useProjects();
  const { getArea } = useAreas();
  const { getTotalSecondsForProject } = useSessions();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#0a84ff");
  const [newTaxa, setNewTaxa] = useState("");
  const [newContexto] = useState<Contexto>("pessoal");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#0a84ff");
  const [editTaxa, setEditTaxa] = useState("");

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

  const startEdit = (id: string) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    setEditingId(id);
    setEditName(p.nome);
    setEditColor(p.cor);
    setEditTaxa(p.taxa_horaria !== undefined ? String(p.taxa_horaria) : "");
  };

  const handleUpdate = () => {
    if (editingId && editName.trim()) {
      updateProject(editingId, {
        nome: editName.trim(),
        cor: editColor,
        taxa_horaria: editTaxa ? parseFloat(editTaxa) : undefined,
      });
    }
    setEditingId(null);
  };

  const inputStyle = {
    backgroundColor: "var(--color-surface)",
    borderColor: "var(--color-separator)",
    color: "var(--color-text-primary)",
    fontSize: "var(--font-size-base)",
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center justify-center"
          aria-label="Voltar"
          style={{ minWidth: "var(--min-touch-target)", minHeight: "var(--min-touch-target)", fontSize: "var(--font-size-xl)", color: "var(--color-text-primary)" }}
        >
          ←
        </button>
        <h1
          className="font-bold"
          style={{ fontSize: "var(--font-size-xl)", color: "var(--color-text-primary)", wordBreak: "break-word" }}
        >
          {area?.nome}
        </h1>
      </div>

      {projects.length === 0 && !isAdding && (
        <p className="mb-6" style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)" }}>
          Nenhum projeto nesta área. Crie o primeiro.
        </p>
      )}

      <div>
        {projects.map((project) => {
          const totalSeconds = getTotalSecondsForProject(project.id);
          const cost = calculateCost(totalSeconds, project.taxa_horaria);

          if (editingId === project.id) {
            return (
              <div
                key={project.id}
                className="border-b py-3 space-y-2"
                style={{ borderColor: "var(--color-separator)" }}
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="w-full p-2 rounded-lg border"
                  style={inputStyle}
                  autoFocus
                />
                <div className="flex gap-3 items-center">
                  <label style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-meta)" }}>Cor:</label>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <label style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-meta)" }}>Taxa (R$):</label>
                  <input
                    type="number"
                    value={editTaxa}
                    onChange={(e) => setEditTaxa(e.target.value)}
                    placeholder="Opcional"
                    className="flex-1 p-2 rounded-lg border"
                    style={inputStyle}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdate} className="flex-1 h-10" style={{ fontSize: "var(--font-size-meta)" }}>
                    Salvar
                  </Button>
                  <Button variant="ghost" onClick={() => setEditingId(null)} className="h-10" style={{ fontSize: "var(--font-size-meta)" }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={project.id}
              className="flex items-center border-b"
              style={{ borderColor: "var(--color-separator)", minHeight: "var(--min-touch-target)" }}
            >
              <button
                onClick={() => onSelectProject(project.id)}
                className="flex-1 text-left py-3 flex items-center gap-3"
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.cor }}
                />
                <div className="flex-1">
                  <div
                    className="font-medium"
                    style={{ fontSize: "var(--font-size-lg)", color: "var(--color-text-primary)", wordBreak: "break-word" }}
                  >
                    {project.nome}
                  </div>
                  <div style={{ fontSize: "var(--font-size-meta)", color: "var(--color-text-secondary)" }}>
                    {formatDuration(totalSeconds)}
                    {cost > 0 && ` • ${formatCost(cost)}`}
                  </div>
                </div>
              </button>
              <button
                onClick={() => startEdit(project.id)}
                className="flex items-center justify-center"
                aria-label={`Editar ${project.nome}`}
                style={{
                  minWidth: "var(--min-touch-target)",
                  minHeight: "var(--min-touch-target)",
                  color: "var(--color-text-secondary)",
                }}
              >
                ✎
              </button>
              <button
                onClick={() => deleteProject(project.id)}
                className="flex items-center justify-center"
                aria-label={`Excluir ${project.nome}`}
                style={{
                  minWidth: "var(--min-touch-target)",
                  minHeight: "var(--min-touch-target)",
                  color: "var(--color-danger)",
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {isAdding ? (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setIsAdding(false);
            }}
            placeholder="Nome do projeto"
            className="w-full p-3 rounded-lg border"
            style={inputStyle}
            autoFocus
          />
          <div className="flex gap-3 items-center">
            <label style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-meta)" }}>Cor:</label>
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-12 h-12 rounded cursor-pointer"
            />
          </div>
          <div className="flex gap-3 items-center">
            <label style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-meta)" }}>
              Taxa horária (R$):
            </label>
            <input
              type="number"
              value={newTaxa}
              onChange={(e) => setNewTaxa(e.target.value)}
              placeholder="Opcional"
              className="flex-1 p-3 rounded-lg border"
              style={inputStyle}
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
          className="mt-6 w-full h-14"
          style={{ fontSize: "var(--font-size-lg)" }}
        >
          + Novo Projeto
        </Button>
      )}
    </div>
  );
}
