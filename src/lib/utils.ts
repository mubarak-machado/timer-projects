import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format seconds to HH:MM:SS
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Format cost with currency
export function formatCost(cost: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cost);
}

// Calculate cost from seconds and hourly rate
export function calculateCost(seconds: number, taxaHoraria?: number): number {
  if (!taxaHoraria) return 0;
  return (seconds / 3600) * taxaHoraria;
}

// Get elapsed seconds from a start date
export function getElapsedSeconds(startDate: Date): number {
  return Math.floor((Date.now() - startDate.getTime()) / 1000);
}

// Format date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

// Format time for display
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
