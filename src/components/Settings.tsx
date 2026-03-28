import { useSettingsStore, FONT_SIZE_LABELS } from "@/store/settings";
import type { FontSizeLevel } from "@/store/settings";
import { Button } from "@/components/ui/button";

interface SettingsProps {
  onBack: () => void;
}

const FONT_LEVELS: FontSizeLevel[] = [1, 2, 3, 4, 5];

export function Settings({ onBack }: SettingsProps) {
  const { theme, fontSizeLevel, setTheme, setFontSizeLevel } = useSettingsStore();

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center justify-center"
          aria-label="Voltar"
          style={{
            minWidth: "var(--min-touch-target)",
            minHeight: "var(--min-touch-target)",
            fontSize: "var(--font-size-xl)",
            color: "var(--color-text-primary)",
          }}
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

      {/* Font size */}
      <section className="mb-8">
        <h2
          className="font-semibold mb-4"
          style={{ fontSize: "var(--font-size-lg)", color: "var(--color-text-primary)" }}
        >
          Tamanho da Fonte
        </h2>
        <div className="space-y-2">
          {FONT_LEVELS.map((level) => {
            const isSelected = fontSizeLevel === level;
            return (
              <button
                key={level}
                onClick={() => setFontSizeLevel(level)}
                className="w-full text-left flex items-center justify-between border-b"
                style={{
                  borderColor: "var(--color-separator)",
                  minHeight: "var(--min-touch-target)",
                  paddingTop: "0.75rem",
                  paddingBottom: "0.75rem",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--font-size-base)",
                    color: isSelected ? "var(--color-accent)" : "var(--color-text-primary)",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {FONT_SIZE_LABELS[level]}
                </span>
                {isSelected && (
                  <span style={{ color: "var(--color-accent)", fontSize: "var(--font-size-lg)" }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Font preview */}
        <div
          className="mt-4 p-4 rounded-xl"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <p
            style={{
              fontSize: "var(--font-size-meta)",
              color: "var(--color-text-secondary)",
              marginBottom: "0.25rem",
            }}
          >
            Prévia — metadados
          </p>
          <p
            style={{
              fontSize: "var(--font-size-base)",
              color: "var(--color-text-primary)",
              marginBottom: "0.25rem",
            }}
          >
            Prévia — corpo do texto
          </p>
          <p
            style={{
              fontSize: "var(--font-size-lg)",
              color: "var(--color-text-primary)",
              fontWeight: 600,
            }}
          >
            Prévia — título
          </p>
        </div>
      </section>

      {/* Theme */}
      <section className="mb-8">
        <h2
          className="font-semibold mb-4"
          style={{ fontSize: "var(--font-size-lg)", color: "var(--color-text-primary)" }}
        >
          Tema
        </h2>
        <div className="space-y-2">
          {(["dark", "light"] as const).map((t) => {
            const isSelected = theme === t;
            const label = t === "dark" ? "Alto Contraste Escuro" : "Alto Contraste Claro";
            return (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="w-full text-left flex items-center justify-between border-b"
                style={{
                  borderColor: "var(--color-separator)",
                  minHeight: "var(--min-touch-target)",
                  paddingTop: "0.75rem",
                  paddingBottom: "0.75rem",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--font-size-base)",
                    color: isSelected ? "var(--color-accent)" : "var(--color-text-primary)",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {label}
                </span>
                {isSelected && (
                  <span style={{ color: "var(--color-accent)", fontSize: "var(--font-size-lg)" }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <Button
        onClick={onBack}
        className="w-full h-14"
        style={{ fontSize: "var(--font-size-lg)" }}
      >
        Concluído
      </Button>
    </div>
  );
}
