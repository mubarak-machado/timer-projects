import { useAreas } from "@/hooks/useAreas";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AreaListProps {
  onSelectArea: (areaId: string) => void;
  onOpenSettings: () => void;
}

export function AreaList({ onSelectArea, onOpenSettings }: AreaListProps) {
  const { areas, addArea, deleteArea } = useAreas();
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newName.trim()) {
      addArea(newName.trim());
      setNewName("");
      setIsAdding(false);
    }
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
          onClick={onOpenSettings}
          className="h-12 w-12 flex items-center justify-center rounded-lg"
          style={{ color: "var(--color-text-secondary)", fontSize: "1.5rem" }}
          aria-label="Configurações"
        >
          ⚙
        </button>
      </div>

      <div className="space-y-2">
        {areas.map((area) => (
          <div
            key={area.id}
            className="flex items-center justify-between p-4 border-b"
            style={{
              borderColor: "var(--color-separator)",
              minHeight: "var(--min-touch-target)",
            }}
          >
            <button
              onClick={() => onSelectArea(area.id)}
              className="flex-1 text-left text-xl"
              style={{ fontSize: "var(--font-size-lg)" }}
            >
              {area.nome}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteArea(area.id)}
              className="text-[--color-danger] h-12 w-12"
              style={{ color: "var(--color-danger)" }}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Nome da área"
            className="flex-1 p-3 text-lg bg-[--color-surface] border rounded-lg"
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
          <Button
            variant="ghost"
            onClick={() => setIsAdding(false)}
            className="h-12"
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          className="mt-6 w-full h-14 text-lg"
          style={{ fontSize: "var(--font-size-lg)" }}
        >
          + Nova Área
        </Button>
      )}
    </div>
  );
}