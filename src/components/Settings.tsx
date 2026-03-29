import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { useAreas } from "@/hooks/useAreas";
import { useState } from "react";
import type { FontLevel } from "@/hooks/useSettings";

interface SettingsProps {
  onBack: () => void;
}

const FONT_LEVEL_LABELS: Record<FontLevel, string> = {
  1: "Menor",
  2: "Pequeno",
  3: "Médio",
  4: "Grande",
  5: "Maior",
};

export function Settings({ onBack }: SettingsProps) {
  const { settings, setTheme, setFontLevel } = useSettings();
  const { areas, addArea, updateArea, deleteArea } = useAreas();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");

  const handleEditArea = (id: string, nome: string) => {
    setEditingId(id);
    setEditName(nome);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updateArea(editingId, editName.trim());
      setEditingId(null);
      setEditName("");
    }
  };

  const handleAddArea = () => {
    if (newAreaName.trim()) {
      addArea(newAreaName.trim());
      setNewAreaName("");
      setIsAddingArea(false);
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
          className="font-bold"
          style={{ fontSize: "var(--font-size-xl)", color: "var(--color-text-primary)" }}
        >
          Configurações
        </h1>
      </div>

      {/* Tema */}
      <section className="mb-8">
        <h2
          className="font-bold mb-3"
          style={{ fontSize: "var(--font-size-lg)", color: "var(--color-text-primary)" }}
        >
          Tema
        </h2>
        <div className="flex gap-3">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className="flex-1 rounded-xl font-medium"
              style={{
                minHeight: "var(--min-touch-target)",
                fontSize: "var(--font-size-base)",
                backgroundColor:
                  settings.theme === t
                    ? "var(--color-accent)"
                    : "var(--color-surface-2)",
                color:
                  settings.theme === t
                    ? "#ffffff"
                    : "var(--color-text-primary)",
              }}
            >
              {t === "dark" ? "Escuro" : "Claro"}
            </button>
          ))}
        </div>
      </section>

      {/* Tamanho de Fonte */}
      <section className="mb-8">
        <h2
          className="font-bold mb-3"
          style={{ fontSize: "var(--font-size-lg)", color: "var(--color-text-primary)" }}
        >
          Tamanho de Fonte
        </h2>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as FontLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setFontLevel(level)}
              className="flex-1 rounded-xl font-medium"
              style={{
                minHeight: "var(--min-touch-target)",
                fontSize: "var(--font-size-base)",
                backgroundColor:
                  settings.fontLevel === level
                    ? "var(--color-accent)"
                    : "var(--color-surface-2)",
                color:
                  settings.fontLevel === level
                    ? "#ffffff"
                    : "var(--color-text-secondary)",
              }}
              aria-label={FONT_LEVEL_LABELS[level]}
            >
              {level}
            </button>
          ))}
        </div>
        <p
          className="mt-2"
          style={{ fontSize: "var(--font-size-meta)", color: "var(--color-text-secondary)" }}
        >
          Atual: {FONT_LEVEL_LABELS[settings.fontLevel]}
        </p>
        {/* Preview */}
        <div
          className="mt-3 p-3 rounded-lg"
          style={{ backgroundColor: "var(--color-surface-2)" }}
        >
          <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-primary)" }}>
            Texto de exemplo neste tamanho
          </p>
        </div>
      </section>

      {/* Gerenciar Áreas */}
      <section>
        <h2
          className="font-bold mb-3"
          style={{ fontSize: "var(--font-size-lg)", color: "var(--color-text-primary)" }}
        >
          Gerenciar Áreas
        </h2>
        <div>
          {areas.map((area) => (
            <div
              key={area.id}
              className="flex items-center gap-3 py-3 border-b"
              style={{ borderColor: "var(--color-separator)" }}
            >
              {editingId === area.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                    className="flex-1 p-2 rounded-lg border"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-separator)",
                      color: "var(--color-text-primary)",
                      fontSize: "var(--font-size-base)",
                      minHeight: "var(--min-touch-target)",
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={handleSaveEdit}
                    className="h-12 px-4"
                    style={{ fontSize: "var(--font-size-base)" }}
                  >
                    Salvar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                    className="h-12"
                    style={{ fontSize: "var(--font-size-base)" }}
                  >
                    ✕
                  </Button>
                </>
              ) : (
                <>
                  <span
                    className="flex-1"
                    style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-primary)" }}
                  >
                    {area.nome}
                  </span>
                  <button
                    onClick={() => handleEditArea(area.id, area.nome)}
                    className="h-12 w-12 flex items-center justify-center rounded-lg"
                    style={{
                      color: "var(--color-accent)",
                      fontSize: "var(--font-size-lg)",
                    }}
                    aria-label={`Editar ${area.nome}`}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteArea(area.id)}
                    className="h-12 w-12 flex items-center justify-center rounded-lg"
                    style={{
                      color: "var(--color-danger)",
                      fontSize: "var(--font-size-lg)",
                    }}
                    aria-label={`Remover ${area.nome}`}
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {isAddingArea ? (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddArea()}
              placeholder="Nome da área"
              className="flex-1 p-3 rounded-lg border"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-separator)",
                color: "var(--color-text-primary)",
                fontSize: "var(--font-size-base)",
                minHeight: "var(--min-touch-target)",
              }}
              autoFocus
            />
            <Button onClick={handleAddArea} className="h-12 px-4">
              Salvar
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsAddingArea(false)}
              className="h-12"
            >
              ✕
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingArea(true)}
            className="mt-4 w-full h-14"
            style={{ fontSize: "var(--font-size-lg)" }}
          >
            + Nova Área
          </Button>
        )}
      </section>
    </div>
  );
}
