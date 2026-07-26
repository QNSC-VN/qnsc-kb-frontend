export type ArticleType = 'POLICY' | 'SOP' | 'DECISION' | 'FAQ' | 'RCA' | 'HOWTO' | 'PLAYBOOK' | 'REFERENCE'
export type Sensitivity = 'public' | 'internal' | 'confidential' | 'restricted'

export interface ArticleCard {
  id: string; title: string; dept: string; domain: string; type: ArticleType | string
  status: string; sensitivity: Sensitivity | string; language: string; version: number
  owner?: string | null; owner_id?: string | null; tags: string[]; related_article_ids: string[]
  next_review?: string | null; last_reviewed?: string | null; needs_update: boolean
  source_count: number
}
