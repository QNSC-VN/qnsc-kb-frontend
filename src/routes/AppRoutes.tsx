import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import LoginPage from '../auth/LoginPage'
import ArticleListPage from '../pages/articles/ArticleListPage'
import ArticleDetailPage from '../pages/articles/ArticleDetailPage'
import ArticleEditPage from '../pages/articles/ArticleEditPage'
import SearchResultsPage from '../pages/search/SearchResultsPage'
import AskPage from '../pages/ai/AskPage'
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
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
