import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import LoginPage from '../auth/LoginPage'
import ArticleListPage from '../pages/articles/ArticleListPage'
import ArticleDetailPage from '../pages/articles/ArticleDetailPage'
import ArticleEditPage from '../pages/articles/ArticleEditPage'
import SearchResultsPage from '../pages/search/SearchResultsPage'
import AskPage from '../pages/ai/AskPage'
import PendingDraftsPage from '../pages/governance/PendingDraftsPage'
import GapQueuePage from '../pages/governance/GapQueuePage'
import AuditLogPage from '../pages/governance/AuditLogPage'
import HealthDashboardPage from '../pages/governance/HealthDashboardPage'
import TagsPage from '../pages/meta/TagsPage'
import GlossaryPage from '../pages/meta/GlossaryPage'
import TaxonomyPage from '../pages/meta/TaxonomyPage'
import ProtectedRoute from './ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/articles" replace />} />
        <Route path="articles" element={<ArticleListPage />} />
        <Route path="articles/new" element={<ArticleEditPage />} />
        <Route path="articles/:id" element={<ArticleDetailPage />} />
        <Route path="articles/:id/edit" element={<ArticleEditPage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="ai" element={<AskPage />} />
        
        {/* Governance */}
        <Route path="governance/pending-drafts" element={<PendingDraftsPage />} />
        <Route path="governance/gap-queue" element={<GapQueuePage />} />
        <Route path="governance/audit-log" element={<AuditLogPage />} />
        <Route path="governance/health" element={<HealthDashboardPage />} />
        
        {/* Meta */}
        <Route path="meta/tags" element={<TagsPage />} />
        <Route path="meta/glossary" element={<GlossaryPage />} />
        <Route path="meta/taxonomy" element={<TaxonomyPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
