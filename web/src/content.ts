import { temas as todos, modoDev } from 'virtual:temas'
import type { Tema } from './types'

// El filtrado por estado ocurre en vite.config.ts (módulo virtual):
// en `npm run dev` llegan todos los temas; en `npm run build`, solo los publicados.
export const temas: Tema[] = todos
export const esDev = modoDev

export function buscarTema(slug: string): Tema | undefined {
  return temas.find((t) => t.slug === slug)
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** "2026-10-13" → "octubre de 2026" */
export function mesYAnio(fecha: string): string {
  const [anio, mes] = fecha.split('-').map(Number)
  return `${MESES[(mes ?? 1) - 1]} de ${anio}`
}

const TUESTES = ['Tueste claro', 'Tueste medio', 'Tueste oscuro']

/** 1 → "●○○" + "Tueste claro" */
export function tueste(nivel: number): { puntos: string; nombre: string } {
  const n = Math.min(3, Math.max(1, Math.round(nivel)))
  return { puntos: '●'.repeat(n) + '○'.repeat(3 - n), nombre: TUESTES[n - 1]! }
}
