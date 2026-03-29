import { useAreas } from "@/hooks/useAreas";
import { useProjects } from "@/hooks/useProjects";
import { useSessions } from "@/hooks/useSessions";
import { formatDuration } from "@/lib/utils";

interface DesktopSidebarProps {
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onOpenSettings: () => void;
}

export function DesktopSidebar({
  selectedProjectId,
  onSelectProject,
  onOpenSettings,
}: DesktopSidebarProps) {
  const { areas } = useAreas();
  const { getProjectsByArea } = useProjects();
  const { getTotalSecondsForProject } = useSessions();

  return (
    <aside
      className="w-64 flex-shrink-0 border-r overflow-y-auto"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-separator)",
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-bold"
            style={{
              fontSize: "var(--font-size-lg)",
              color: "var(--color-text-primary)",
            }}
          >
            Áreas
          </h2>
          <button
            onClick={onOpenSettings}
            className="h-10 w-10 flex items-center justify-center rounded-lg"
            style={{ color: "var(--color-text-secondary)", fontSize: "1.25rem" }}
            aria-label="Configurações"
          >
            ⚙
          </button>
        </div>

        {areas.map((area) => {
          const areaProjects = getProjectsByArea(area.id);
          return (
            <div key={area.id} className="mb-4">
              <div
                className="font-medium mb-2"
                style={{
                  fontSize: "var(--font-size-base)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {area.nome}
              </div>
              <div className="space-y-1">
                {areaProjects.map((project) => {
                  const totalSeconds = getTotalSecondsForProject(project.id);
                  const isSelected = selectedProjectId === project.id;
                  return (
                    <button
                      key={project.id}
                      onClick={() => onSelectProject(project.id)}
                      className="w-full text-left p-3 rounded-lg flex items-center gap-3"
                      style={{
                        backgroundColor: isSelected
                          ? "var(--color-accent)"
                          : "transparent",
                        minHeight: "var(--min-touch-target)",
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.cor }}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-medium"
                          style={{
                            fontSize: "var(--font-size-base)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {project.nome}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--font-size-meta)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {formatDuration(totalSeconds)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}