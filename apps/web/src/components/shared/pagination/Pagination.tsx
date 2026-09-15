import type { CSSProperties, FC } from 'react';
import styles from './Pagination.module.css';

export interface PaginationProps {
  /** Current active page (1-indexed, defaults to 1) */
  currentPage?: number;
  /** Total number of pages (defaults to 1) */
  totalPages?: number;
  /** Total count of items across all pages */
  totalItems?: number;
  /** Number of items displayed per page */
  pageSize?: number;
  /** Available page size choices (e.g. [6, 12, 24]) */
  pageSizeOptions?: number[];
  /** Callback fired when a new page is clicked */
  onPageChange?: (page: number) => void;
  /** Callback fired when page size changes */
  onPageSizeChange?: (size: number) => void;
  /** Custom container style */
  style?: CSSProperties;
  /** Custom class name */
  className?: string;
  /** Test identifier */
  testID?: string;
}

const ChevronLeftIcon: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (currentPage > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);
  return pages;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  pageSize,
  onPageChange,
  style,
  className,
  testID,
}) => {
  const pages = getPageNumbers(currentPage, totalPages);

  const startItem = totalItems !== undefined && pageSize !== undefined
    ? Math.min((currentPage - 1) * pageSize + 1, totalItems)
    : undefined;
  const endItem = totalItems !== undefined && pageSize !== undefined
    ? Math.min(currentPage * pageSize, totalItems)
    : undefined;

  return (
    <nav
      data-testid={testID}
      aria-label="Pagination Navigation"
      className={`${styles.paginationContainer} ${className ?? ''}`}
      style={style}
    >
      {/* Summary info */}
      <div className={styles.summaryArea}>
        <div className={styles.summary}>
          {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
            <span>
              Showing <strong>{startItem}–{endItem}</strong> of <strong>{totalItems}</strong> spaces
            </span>
          ) : (
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className={styles.controls}>
        {/* Previous Page */}
        <button
          type="button"
          className={styles.pageButton}
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
        >
          <ChevronLeftIcon size={14} />
        </button>

        {/* Page Numbers */}
        {pages.map((page, idx) => {
          if (page === 'ellipsis') {
            return (
              <span key={`ellipsis-${idx}`} className={styles.ellipsis} aria-hidden="true">
                …
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              className={`${styles.pageButton} ${isActive ? styles.activePage : ''}`}
              onClick={() => onPageChange?.(page)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          type="button"
          className={styles.pageButton}
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
        >
          <ChevronRightIcon size={14} />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
