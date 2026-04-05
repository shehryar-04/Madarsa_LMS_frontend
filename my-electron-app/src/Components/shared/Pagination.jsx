import React from 'react'

/** Returns page numbers with ellipsis for large page counts */
function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const pages = [1]
  if (currentPage > 4) pages.push('…')

  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 3) pages.push('…')
  pages.push(totalPages)

  return pages
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="pagination">
      <button className="page-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        ← Prev
      </button>

      {getPageNumbers(currentPage, totalPages).map((p, i) =>
        p === '…'
          ? <span key={`dots-${i}`} className="page-dots">…</span>
          : (
            <button
              key={p}
              className={`page-btn ${p === currentPage ? 'page-active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
      )}

      <button className="page-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        Next →
      </button>
    </div>
  )
}
