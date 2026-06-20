export type UserRole = 'admin' | 'coordinacion' | 'direccion' | 'docente' | 'alumno'
export type DocType = 'creativo' | 'guion_literario' | 'guion_tecnico' | 'calendario' | 'progreso'
export type ReviewStatus = 'sin_revisar' | 'aprobado' | 'requiere_correccion' | 'no_aprobado'

// Los únicos 3 correos con acceso al sistema, por ahora
export const ALLOWED_EMAILS: Record<string, UserRole> = {
  'computacion@emlider.edu.mx': 'admin',
  'coordinacion@emlider.edu.mx': 'coordinacion',
  'direccion@emlider.edu.mx': 'direccion',
}

export function roleForEmail(email: string): UserRole | null {
  return ALLOWED_EMAILS[email.toLowerCase()] ?? null
}

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface Project {
  id: string
  slug: string
  brand_name: string
  film_title: string
  genre: string
  accent_color: string
  order_index: number
}

export interface ProjectDocument {
  id: string
  project_id: string
  doc_type: DocType
  html_content: string | null
  updated_at: string
}

export interface ProjectReview {
  id: string
  project_id: string
  reviewer_id: string | null
  status: ReviewStatus
  observations: string | null
  reviewed_at: string | null
  updated_at: string
}

export interface ShootingSchedule {
  id: string
  project_id: string
  shoot_date: string
  shoot_time: string
  notes: string | null
}

export interface ProjectProgress {
  id: string
  project_id: string
  preproduccion_pct: number
  produccion_pct: number
  postproduccion_pct: number
  updated_at: string
}

export interface WorkHubItem {
  id: string
  title: string
  description: string | null
  html_content: string | null
  file_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  author_id: string | null
  message: string
  resolved: boolean
  created_at: string
}
