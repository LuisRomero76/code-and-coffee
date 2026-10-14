export type Estado = 'borrador' | 'pagina-aprobada' | 'video-listo' | 'publicado'
export type Expresion = 'happy' | 'wow'
export type Pose = 'wave' | 'point' | 'rest'

export interface Codigo {
  archivo: string
  lenguaje: string
  contenido: string
}

export interface Paso {
  titulo: string
  texto: string
  codigo?: Codigo
  probado?: boolean
}

export interface ErrorComun {
  problema: string
  solucion: string
}

export interface Tema {
  slug: string
  estado: Estado
  fecha: string
  serie?: { nombre: string; parte: number; total: number }
  hero: {
    migas: string
    titulo: string
    subtitulo: string
    intro: string
    duracion: string
    tueste: number
    tarjetas: string[]
  }
  secciones: {
    queEs: string[]
    requisitos: string[]
    pasos: Paso[]
    mokaDice?: { paso: number; texto: string }
    errores: ErrorComun[]
    resumen: string
  }
  miniatura: {
    titulo: string
    resaltado: string
    etiqueta: string
    variante: 't1' | 't2' | 't3'
    moka: { expresion: Expresion; pose: Pose }
    tarjeta: string
  }
  fuentes: string[]
}

export interface TemaAdmin {
  slug: string
  titulo: string
  estado: Estado
  fecha: string
}
