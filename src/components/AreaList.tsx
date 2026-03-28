import { useAreas } from "@/hooks/useAreas";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AreaListProps {
  onSelectArea: (areaId: string) => void;
  onSettings: () => void;
}

export function AreaList({ onSelectArea, onSettings }: AreaListProps) {
  const { areas, addArea, updateArea, deleteArea } = useAreas();
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = () => {
    if (newName.trim()) {
      addArea(newName.trim());
      setNewName("");
      setIsAdding(false);
    }
  };

  const startEdit = (id: string, nome: string) => {
    setEditingId(id);
    setEditName(nome);
  };

  const handleUpdate = () => {
    if (editingId && editName.trim()) {
      updateArea(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="font-bold"
          style={{ fontSize: "var(--font-size-xl)", color: "var(--color-text-primary)" }}
        >
          Áreas
        </h1>
        <button
          onClick={onSettings}
          className="flex items-center justify-center rounded-lg"
          aria-label="Configurações"
          style={{
            minWidth: "var(--min-touch-target)",
            minHeight: "var(--min-touch-target)",
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-lg)",
          }}
        >
          ⚙
        </button>
      </div>

      {areas.length === 0 && !isAdding && (
        <p
          className="mb-6"
          style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)" }}
        >
          Nenhuma área criada. Crie sua primeira área para começar.
        </p>
      )}

      <div>
        {areas.map((area) => (
          <div
            key={area.id}
            className="flex items-center border-b"
            style={{ borderColor: "var(--color-separator)", minHeight: "var(--min-touch-target)" }}
          >
            {editingId === area.id ? (
              <div className="flex flex-1 gap-2 py-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 p-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-separator)",
                    color: "var(--color-text-primary)",
                    fontSize: "var(--font-size-base)",
                  }}
                  autoFocus
                />
                <Button onClick={handleUpdate} className="h-10 px-4" style={{ fontSize: "var(--font-size-meta)" }}>
                  OK
                </Button>
                <Button variant="ghost" onClick={() => setEditingId(null)} className="h-10" style={{ fontSize: "var(--font-size-meta)" }}>
                  ✕
                </Button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onSelectArea(area.id)}
                  className="flex-1 text-left py-3 pr-2"
                  style={{ fontSize: "var(--font-size-lg)", color: "var(--color-text-primary)", wordBreak: "break-word" }}
                >
                  {area.nome}
                </button>
                <button
                  onClick={() => startEdit(area.id, area.nome)}
                  className="flex items-center justify-center"
                  aria-label={`Editar ${area.nome}`}
                  style={{
                    minWidth: "var(--min-touch-target)",
                    minHeight: "var(--min-touch-target)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  ✎
                </button>
                <button
                  onClick={() => deleteArea(area.id)}
                  className="flex items-center justify-center"
                  aria-label={`Excluir ${area.nome}`}
                  style={{
                    minWidth: "var(--min-touch-target)",
                    minHeight: "var(--min-touch-target)",
                    color: "var(--color-danger)",
                  }}
                >
                  ✕
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setIsAdding(false);
            }}
            placeholder="Nome da área"
            className="flex-1 p-3 rounded-lg border"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-separator)",
              color: "var(--color-text-primary)",
              fontSize: "var(--font-size-base)",
            }}
            autoFocus
          />
          <Button onClick={handleAdd} className="h-12 px-6">
            Salvar
          </Button>
          <Button variant="ghost" onClick={() => setIsAdding(false)} className="h-12">
            ✕
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          className="mt-6 w-full h-14"
          style={{ fontSize: "var(--font-size-lg)" }}
        >
          + Nova Área
        </Button>
      )}
    </div>
  );
}
