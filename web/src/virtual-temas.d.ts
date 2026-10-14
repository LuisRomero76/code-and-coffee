declare module 'virtual:temas' {
  import type { Tema } from './types'
  /** En dev: todos los temas. En build: solo los publicados. */
  export const temas: Tema[]
  export const modoDev: boolean
}
