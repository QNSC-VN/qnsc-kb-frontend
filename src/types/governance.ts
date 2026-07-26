export interface HomeSummary { total_articles: number; departments: number; domains: number; with_owner_percent: number; needs_review: number; pending_drafts: number; open_gaps: number; recent: import('./article').ArticleCard[] }
export interface Gap { id: string; query: string; count: number; dept?: string | null; status: string }
export interface Template { name: string; description: string; sections: string[] }
