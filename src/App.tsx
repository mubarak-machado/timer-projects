import { useState, useEffect } from "react";
import { AreaList } from "@/components/AreaList";
import { ProjectList } from "@/components/ProjectList";
import { ProjectDetail } from "@/components/ProjectDetail";
import { ActiveTimerBanner } from "@/components/ActiveTimerBanner";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { DesktopProjectView } from "@/components/DesktopProjectView";
import { Settings } from "@/components/Settings";
import { useTimerStore } from "@/store/timer";

type Page =
  | { view: "areas" }
  | { view: "projects"; areaId: string }
  | { view: "project"; projectId: string; fromAreaId?: string }
  | { view: "settings" };

function App() {
  const [page, setPage] = useState<Page>({ view: "areas" });
  const [isDesktop, setIsDesktop] = useState(false);
  const activeSession = useTimerStore((s) => s.activeSession);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const navigateToProject = (projectId: string, fromAreaId?: string) => {
    setPage({ view: "project", projectId, fromAreaId });
  };

  const showBanner = activeSession && page.view !== "project";

  // Desktop layout: sidebar + main area
  if (isDesktop) {
    return (
      <div
        className="flex h-screen"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        {showBanner && (
          <ActiveTimerBanner
            onClick={() =>
              setPage({ view: "project", projectId: activeSession.projetoId })
            }
          />
        )}

        <DesktopSidebar
          selectedProjectId={page.view === "project" ? page.projectId : null}
          onSelectProject={navigateToProject}
          onSettings={() => setPage({ view: "settings" })}
        />

        <main className="flex-1 overflow-hidden overflow-y-auto">
          {page.view === "project" ? (
            <DesktopProjectView projectId={page.projectId} />
          ) : page.view === "settings" ? (
            <div className="max-w-lg mx-auto">
              <Settings onBack={() => setPage({ view: "areas" })} />
            </div>
          ) : (
            <div
              className="h-full flex items-center justify-center"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <p style={{ fontSize: "var(--font-size-lg)" }}>
                Selecione um projeto na barra lateral
              </p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Mobile layout: stacked pages
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
            onSettings={() => setPage({ view: "settings" })}
          />
        )}

        {page.view === "projects" && (
          <ProjectList
            areaId={page.areaId}
            onBack={() => setPage({ view: "areas" })}
            onSelectProject={(projectId) => navigateToProject(projectId, page.areaId)}
          />
        )}

        {page.view === "project" && (
          <ProjectDetail
            projectId={page.projectId}
            onBack={() => {
              if (page.fromAreaId) {
                setPage({ view: "projects", areaId: page.fromAreaId });
              } else {
                setPage({ view: "areas" });
              }
            }}
          />
        )}

        {page.view === "settings" && (
          <Settings onBack={() => setPage({ view: "areas" })} />
        )}
      </div>
    </div>
  );
}

export default App;