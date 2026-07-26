export interface SearchResult { id: string; title: string; snippet?: string; score?: number; article_id?: string; [key: string]: unknown }
export interface BrowseResponse { taxonomy: Record<string, Record<string, number>>; articles: import('./article').ArticleCard[] }
