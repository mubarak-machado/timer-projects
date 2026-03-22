import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ManualEntryProps {
  onSave: (data: { inicio: string; fim: string; nota?: string }) => void;
  onCancel: () => void;
}

export function ManualEntry({ onSave, onCancel }: ManualEntryProps) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [nota, setNota] = useState("");

  const handleSave = () => {
    const inicio = `${date}T${startTime}:00`;
    const fim = `${date}T${endTime}:00`;

    if (new Date(fim) <= new Date(inicio)) {
      alert("A hora de fim deve ser após a hora de início.");
      return;
    }

    onSave({ inicio, fim, nota: nota.trim() || undefined });
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="text-2xl h-12 flex items-center"
          aria-label="Cancelar"
        >
          ←
        </button>
        <h1
          className="text-xl font-bold"
          style={{ fontSize: "var(--font-size-lg)" }}
        >
          Lançamento Manual
        </h1>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className="block mb-2 font-medium"
            style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-primary)" }}
          >
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 text-lg rounded-lg border"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-separator)",
              color: "var(--color-text-primary)",
              fontSize: "var(--font-size-base)",
              minHeight: "var(--min-touch-target)",
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block mb-2 font-medium"
              style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-primary)" }}
            >
              Início
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-3 text-lg rounded-lg border"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-separator)",
                color: "var(--color-text-primary)",
                fontSize: "var(--font-size-base)",
                minHeight: "var(--min-touch-target)",
              }}
            />
          </div>
          <div>
            <label
              className="block mb-2 font-medium"
              style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-primary)" }}
            >
              Fim
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-3 text-lg rounded-lg border"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-separator)",
                color: "var(--color-text-primary)",
                fontSize: "var(--font-size-base)",
                minHeight: "var(--min-touch-target)",
              }}
            />
          </div>
        </div>

        <div>
          <label
            className="block mb-2 font-medium"
            style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-primary)" }}
          >
            Nota (opcional)
          </label>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="O que você fez nesta sessão?"
            rows={3}
            className="w-full p-3 text-lg rounded-lg border resize-none"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-separator)",
              color: "var(--color-text-primary)",
              fontSize: "var(--font-size-base)",
            }}
          />
        </div>

        <div className="pt-4 space-y-3">
          <Button
            onClick={handleSave}
            className="w-full h-14"
            style={{ fontSize: "var(--font-size-lg)" }}
          >
            Salvar Registro
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full h-12"
            style={{ fontSize: "var(--font-size-base)" }}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}