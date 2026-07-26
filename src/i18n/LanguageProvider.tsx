import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'en' | 'vi'

const messages: Record<Language, Record<string, string>> = {
  en: {
    'app.knowledgeBase': 'Knowledge Base',
    'language.english': 'English',
    'language.vietnamese': 'Vietnamese',
    'language.switch': 'Language',
    'nav.knowledge': 'Knowledge',
    'nav.articles': 'Articles',
    'nav.search': 'Search',
    'nav.aiAssistant': 'AI Assistant',
    'nav.governance': 'Governance',
    'nav.pendingDrafts': 'Pending Drafts',
    'nav.gapQueue': 'Gap Queue',
    'nav.healthDashboard': 'Health Dashboard',
    'nav.auditLogs': 'Audit Logs',
    'nav.usersRoles': 'Users & roles',
    'nav.sourceConnectors': 'Source connectors',
    'nav.featureControls': 'Feature controls',
    'nav.metadata': 'Metadata',
    'nav.tags': 'Tags',
    'nav.glossary': 'Glossary',
    'nav.taxonomy': 'Taxonomy',
    'nav.logOut': 'Log Out',
    'header.searchPlaceholder': 'Global search articles, gaps, or glossary...',
    'auth.signIn': 'Sign in',
    'auth.signInEmail': 'Sign in with email',
    'auth.signingIn': 'Signing in…',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.invalidCredentials': 'Invalid email or password',
    'articles.workspace': 'Knowledge workspace',
    'articles.title': 'Articles',
    'articles.subtitle': 'Find, review, and maintain the documents your team trusts.',
    'articles.uploadSources': 'Upload sources',
    'articles.processing': 'Processing...',
    'articles.newArticle': 'New Article',
    'articles.visible': 'Visible articles',
    'articles.published': 'Published',
    'articles.inProgress': 'In progress',
    'articles.protected': 'Protected',
    'articles.find': 'Find an article',
    'articles.findHelp': 'Use filters to narrow the workspace',
    'articles.searchText': 'Search Text',
    'articles.searchTitle': 'Search title...',
    'articles.department': 'Department',
    'articles.allDepartments': 'All Departments',
    'articles.type': 'Type',
    'articles.allTypes': 'All Types',
    'articles.sensitivity': 'Sensitivity',
    'articles.allSensitivity': 'All Sensitivity',
    'articles.status': 'Status',
    'articles.allStatuses': 'All Statuses',
    'articles.noArticles': 'No articles found.',
    'articles.back': 'Back to Articles',
    'articles.versionHistory': 'Version History',
    'articles.restoreActive': 'Restore as active',
    'articles.active': 'Active',
    'articles.restoreTitle': 'Restore version',
    'articles.restoreConfirm': 'Restore version {{version}} as the active version? This will create a new version and keep all existing history.',
    'articles.restoreButton': 'Restore as active',
    'articles.versionRestored': 'Version {{version}} was restored as active version {{newVersion}}.',
    'search.hybrid': 'Hybrid Search',
    'search.subtitle': 'Queries both keywords and semantic meanings simultaneously',
    'search.placeholder': 'Type your search keyword or conceptual query...',
    'search.searching': 'Searching...',
    'search.filters': 'Filters:',
    'search.reset': 'Reset',
    'search.noMatches': 'No matches found',
    'search.matchStrength': 'Match Strength',
    'chat.history': 'Chat history',
    'chat.new': 'New Chat',
    'chat.ready': 'Ready',
    'chat.askPlaceholder': 'Ask a question about your documents...',
    'chat.askKnowledge': 'Ask your knowledge base',
    'chat.findChat': 'Find a chat...',
    'meta.tagsDatabase': 'Tags Database',
    'meta.glossaryTerms': 'Glossary Terms',
    'meta.taxonomyHierarchy': 'Taxonomy Hierarchy',
    'governance.searchGaps': 'Search Gaps',
    'governance.pendingDrafts': 'Pending drafts',
    'governance.refreshQueue': 'Refresh queue',
    'governance.health': 'KB Health Dashboard',
    'governance.audit': 'Audit Trail Logs',
    'admin.featureControls': 'Feature controls',
    'admin.manageUsers': 'Manage users',
    'admin.sourceConnectors': 'Source connectors',
    'common.loading': 'Loading...',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.confirm': 'Confirm',
    'common.error': 'Something went wrong',
  },
  vi: {
    'app.knowledgeBase': 'Cơ sở tri thức',
    'language.english': 'Tiếng Anh',
    'language.vietnamese': 'Tiếng Việt',
    'language.switch': 'Ngôn ngữ',
    'nav.knowledge': 'Tri thức',
    'nav.articles': 'Tài liệu',
    'nav.search': 'Tìm kiếm',
    'nav.aiAssistant': 'Trợ lý AI',
    'nav.governance': 'Quản trị',
    'nav.pendingDrafts': 'Bản nháp chờ duyệt',
    'nav.gapQueue': 'Hàng đợi thiếu hụt',
    'nav.healthDashboard': 'Tổng quan sức khỏe',
    'nav.auditLogs': 'Nhật ký kiểm toán',
    'nav.usersRoles': 'Người dùng & vai trò',
    'nav.sourceConnectors': 'Kết nối nguồn',
    'nav.featureControls': 'Điều khiển tính năng',
    'nav.metadata': 'Siêu dữ liệu',
    'nav.tags': 'Thẻ',
    'nav.glossary': 'Thuật ngữ',
    'nav.taxonomy': 'Phân loại',
    'nav.logOut': 'Đăng xuất',
    'header.searchPlaceholder': 'Tìm tài liệu, yêu cầu thiếu hụt hoặc thuật ngữ...',
    'auth.signIn': 'Đăng nhập',
    'auth.signInEmail': 'Đăng nhập bằng email',
    'auth.signingIn': 'Đang đăng nhập…',
    'auth.email': 'Email',
    'auth.password': 'Mật khẩu',
    'auth.invalidCredentials': 'Email hoặc mật khẩu không hợp lệ',
    'articles.workspace': 'Không gian tri thức',
    'articles.title': 'Tài liệu',
    'articles.subtitle': 'Tìm, xem xét và duy trì các tài liệu đáng tin cậy của đội ngũ.',
    'articles.uploadSources': 'Tải nguồn lên',
    'articles.processing': 'Đang xử lý...',
    'articles.newArticle': 'Tài liệu mới',
    'articles.visible': 'Tài liệu hiển thị',
    'articles.published': 'Đã xuất bản',
    'articles.inProgress': 'Đang xử lý',
    'articles.protected': 'Được bảo vệ',
    'articles.find': 'Tìm tài liệu',
    'articles.findHelp': 'Sử dụng bộ lọc để thu hẹp không gian làm việc',
    'articles.searchText': 'Tìm trong văn bản',
    'articles.searchTitle': 'Tìm theo tiêu đề...',
    'articles.department': 'Phòng ban',
    'articles.allDepartments': 'Tất cả phòng ban',
    'articles.type': 'Loại',
    'articles.allTypes': 'Tất cả loại',
    'articles.sensitivity': 'Mức độ nhạy cảm',
    'articles.allSensitivity': 'Tất cả mức độ',
    'articles.status': 'Trạng thái',
    'articles.allStatuses': 'Tất cả trạng thái',
    'articles.noArticles': 'Không tìm thấy tài liệu.',
    'articles.back': 'Quay lại tài liệu',
    'articles.versionHistory': 'Lịch sử phiên bản',
    'articles.restoreActive': 'Khôi phục thành bản đang dùng',
    'articles.active': 'Đang dùng',
    'articles.restoreTitle': 'Khôi phục phiên bản',
    'articles.restoreConfirm': 'Khôi phục phiên bản {{version}} thành bản đang dùng? Hệ thống sẽ tạo phiên bản mới và giữ nguyên toàn bộ lịch sử.',
    'articles.restoreButton': 'Khôi phục thành bản đang dùng',
    'articles.versionRestored': 'Đã khôi phục phiên bản {{version}} thành phiên bản đang dùng {{newVersion}}.',
    'search.hybrid': 'Tìm kiếm kết hợp',
    'search.subtitle': 'Tìm đồng thời theo từ khóa và ý nghĩa ngữ nghĩa',
    'search.placeholder': 'Nhập từ khóa hoặc câu hỏi cần tìm...',
    'search.searching': 'Đang tìm kiếm...',
    'search.filters': 'Bộ lọc:',
    'search.reset': 'Đặt lại',
    'search.noMatches': 'Không tìm thấy kết quả',
    'search.matchStrength': 'Độ phù hợp',
    'chat.history': 'Lịch sử trò chuyện',
    'chat.new': 'Cuộc trò chuyện mới',
    'chat.ready': 'Sẵn sàng',
    'chat.askPlaceholder': 'Đặt câu hỏi về tài liệu của bạn...',
    'chat.askKnowledge': 'Hỏi cơ sở tri thức',
    'chat.findChat': 'Tìm cuộc trò chuyện...',
    'meta.tagsDatabase': 'Cơ sở dữ liệu thẻ',
    'meta.glossaryTerms': 'Các thuật ngữ',
    'meta.taxonomyHierarchy': 'Cấu trúc phân loại',
    'governance.searchGaps': 'Khoảng trống tìm kiếm',
    'governance.pendingDrafts': 'Bản nháp chờ duyệt',
    'governance.refreshQueue': 'Làm mới hàng đợi',
    'governance.health': 'Tổng quan sức khỏe cơ sở tri thức',
    'governance.audit': 'Nhật ký kiểm toán',
    'admin.featureControls': 'Điều khiển tính năng',
    'admin.manageUsers': 'Quản lý người dùng',
    'admin.sourceConnectors': 'Kết nối nguồn',
    'common.loading': 'Đang tải...',
    'common.cancel': 'Hủy',
    'common.close': 'Đóng',
    'common.save': 'Lưu',
    'common.confirm': 'Xác nhận',
    'common.error': 'Đã xảy ra lỗi',
  },
}

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, variables?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = window.localStorage.getItem('qnsc-language')
    return stored === 'vi' ? 'vi' : 'en'
  })

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    window.localStorage.setItem('qnsc-language', next)
  }

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (key, variables) => {
      let result = messages[language][key] || messages.en[key] || key
      Object.entries(variables || {}).forEach(([name, replacement]) => {
        result = result.replaceAll(`{{${name}}}`, String(replacement))
      })
      return result
    },
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider')
  return value
}
