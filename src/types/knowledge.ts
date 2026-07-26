import type { ArticleCard } from './article'
import type { Template } from './governance'

export interface SourceRecord { id: string; article_id: string; article_title: string; source_system: string; source_ref: string; filename?: string | null; mime_type?: string | null; ingested_at?: string; has_file: boolean }
export interface PermissionSummary { current_user: { id: string; name: string; role: string; dept?: string | null }; groups: { id: string; name: string; bitmask_position: number; member: boolean }[]; visible_article_count: number; restricted_count: number }
export type TemplateCatalog = Record<string, Template>
export interface KnowledgeBrowse { taxonomy: Record<string, Record<string, number>>; articles: ArticleCard[] }
