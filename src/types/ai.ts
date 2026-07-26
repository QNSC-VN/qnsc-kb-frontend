export interface Citation { article_id: string; title?: string; section_ref?: string; page_number?: number; text?: string }
export interface AIAnswer { answer: string; citations: Citation[]; [key: string]: unknown }
