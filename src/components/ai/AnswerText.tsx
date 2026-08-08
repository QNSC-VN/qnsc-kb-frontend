import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

export interface AnswerCitation {
  source_index?: number
  article_id: string
  title: string
  source_ref: string
  section_ref?: string
  page_number?: number
}

interface AnswerTextProps {
  content: string
  citations?: AnswerCitation[]
  onCitationClick: (citation: AnswerCitation) => void
}

const CITATION_REGEX = /\[(?:Source ID:\s*)?(\d+)\]/g

/** Render grounded answers like DocNexus while making every citation interactive. */
export default function AnswerText({ content, citations = [], onCitationClick }: AnswerTextProps) {
  const findCitation = (number: number) => citations.find((citation) => citation.source_index === number)
    || (citations.every((citation) => citation.source_index == null) ? citations[number > 0 ? number - 1 : 0] : undefined)

  const processCitations = (children: React.ReactNode): React.ReactNode => React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      const nodes: React.ReactNode[] = []
      let last = 0
      child.replace(CITATION_REGEX, (match, number: string, offset: number) => {
        if (offset > last) nodes.push(child.slice(last, offset))
        const citation = findCitation(Number(number))
        if (citation) {
          const index = Number(number) > 0 ? Number(number) : 1
          nodes.push(
            <button
              key={`citation-${offset}`}
              type="button"
              className="mx-0.5 inline-flex items-center rounded-md border border-minimaxBlue/40 bg-blue-500/15 px-1.5 py-0.5 align-baseline text-[11px] font-semibold text-blue-300 transition hover:bg-blue-500/25"
              title={`${citation.title}${citation.page_number ? ` — page ${citation.page_number}` : ''}`}
              onClick={() => onCitationClick(citation)}
            >
              [{index}]
            </button>,
          )
        } else {
          nodes.push(match)
        }
        last = offset + match.length
        return match
      })
      if (last < child.length) nodes.push(child.slice(last))
      return nodes.length <= 1 ? (nodes[0] ?? child) : nodes
    }
    if (React.isValidElement(child) && child.props.children) {
      return React.cloneElement(child, { children: processCitations(child.props.children) })
    }
    return child
  })

  const withCitations = (tag: React.ElementType) => ({ children, ...props }: any) =>
    React.createElement(tag, props, processCitations(children))

  return (
    <div className="prose prose-invert max-w-none text-sm leading-7 prose-headings:font-semibold prose-headings:text-ink prose-p:text-ink prose-li:text-ink prose-strong:text-ink prose-code:rounded prose-code:bg-surface-soft prose-code:px-1 prose-code:py-0.5 prose-pre:rounded-xl prose-pre:border prose-pre:border-hairline prose-pre:bg-surface prose-blockquote:border-minimaxBlue prose-blockquote:text-steel">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          p: withCitations('p'), li: withCitations('li'), td: withCitations('td'), th: withCitations('th'),
          strong: withCitations('strong'), em: withCitations('em'), span: withCitations('span'),
          blockquote: withCitations('blockquote'), h1: withCitations('h1'), h2: withCitations('h2'),
          h3: withCitations('h3'), h4: withCitations('h4'), h5: withCitations('h5'), h6: withCitations('h6'),
          del: withCitations('del'), code: withCitations('code'),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
