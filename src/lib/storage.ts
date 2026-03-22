import type { Area, Projeto, Sessao } from "../types";

const PREFIX = "timer_app_";

function getItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

// Areas
export function getAreas(): Area[] {
  return getItem("areas", []);
}

export function saveAreas(areas: Area[]): void {
  setItem("areas", areas);
}

// Projects
export function getProjects(): Projeto[] {
  return getItem("projects", []);
}

export function saveProjects(projects: Projeto[]): void {
  setItem("projects", projects);
}

// Sessions
export function getSessions(): Sessao[] {
  return getItem("sessions", []);
}

export function saveSessions(sessions: Sessao[]): void {
  setItem("sessions", sessions);
}

// Generate UUID
export function generateId(): string {
  return crypto.randomUUID();
}