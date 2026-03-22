import { useState } from "react";
import { AreaList } from "@/components/AreaList";
import { ProjectList } from "@/components/ProjectList";
import { ProjectDetail } from "@/components/ProjectDetail";
import { ActiveTimerBanner } from "@/components/ActiveTimerBanner";
import { useTimerStore } from "@/store/timer";
import { useProjects } from "@/hooks/useProjects";

type Page =
  | { view: "areas" }
  | { view: "projects"; areaId: string }
  | { view: "project"; projectId: string };

function App() {
  const [page, setPage] = useState<Page>({ view: "areas" });
  const activeSession = useTimerStore((s) => s.activeSession);
  const { getProject } = useProjects();

  const navigateToProject = (projectId: string) => {
    setPage({ view: "project", projectId });
  };

  const showBanner = activeSession && page.view !== "project";

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {showBanner && (
        <ActiveTimerBanner
          onClick={() =>
            setPage({ view: "project", projectId: activeSession.projetoId })
          }
        />
      )}

      <div className={showBanner ? "pt-16" : ""}>
        {page.view === "areas" && (
          <AreaList
            onSelectArea={(areaId) => setPage({ view: "projects", areaId })}
          />
        )}

        {page.view === "projects" && (
          <ProjectList
            areaId={page.areaId}
            onBack={() => setPage({ view: "areas" })}
            onSelectProject={navigateToProject}
          />
        )}

        {page.view === "project" && (
          <ProjectDetail
            projectId={page.projectId}
            onBack={() => {
              const project = getProject(page.projectId);
              if (project) {
                setPage({ view: "projects", areaId: project.area_id });
              } else {
                setPage({ view: "areas" });
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;