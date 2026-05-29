import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * D1.7 — Table Primitive Component System
 *
 * Compound component pattern — all sub-components are attached to the
 * Table namespace: Table.Head, Table.Body, Table.Row, Table.Header, Table.Cell.
 *
 * Visual rules:
 *   - No outer border — the table floats on its surface
 *   - Header bottom border: 4px solid swiss-black (heavy rule)
 *   - Row separators: 1px swiss-gray-200 (hairline — barely visible)
 *   - Column headers: uppercase, gray, small, tracked
 *   - Row hover (hoverable): swiss-gray-50 background fill — NOT inversion
 *     (data rows are not actions; inversion is reserved for action cards)
 *   - Numeric columns: right-aligned, tabular-nums
 *   - Destructive action links: swiss-red
 *   - No zebra striping
 *   - No rounded corners anywhere
 */

/* ── Table (Container) ──────────────────────────────────────── */
const Table = ({ children, className = '' }) => (
  <div className={`w-full overflow-x-auto ${className}`}>
    <table
      className="w-full"
      style={{ borderCollapse: 'collapse' }}
    >
      {children}
    </table>
  </div>
);

/* ── Table.Head ─────────────────────────────────────────────── */
Table.Head = function TableHead({ children }) {
  return (
    <thead
      className="bg-swiss-white"
      style={{ borderBottom: '4px solid #0F0F0F' }}
    >
      {children}
    </thead>
  );
};

/* ── Table.Body ─────────────────────────────────────────────── */
Table.Body = function TableBody({ children }) {
  return <tbody>{children}</tbody>;
};

/* ── Table.Row ──────────────────────────────────────────────── */
Table.Row = function TableRow({
  children,
  hoverable = false,
  onClick,
  expanded = false,
  className = '',
}) {
  return (
    <tr
      onClick={onClick}
      className={[
        'transition-colors duration-fast',
        // Hairline row separator — 1px, barely visible. Not zebra.
        'border-b border-1 border-swiss-gray-200',
        // Hover: subtle gray fill — not an inversion (data rows are not actions)
        hoverable && !expanded ? 'hover:bg-swiss-gray-50' : '',
        // Expanded: gray background + left accent border
        expanded ? 'bg-swiss-gray-100' : '',
        // Cursor
        onClick ? 'cursor-pointer' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={expanded ? { borderLeft: '4px solid #0F0F0F' } : {}}
    >
      {children}
    </tr>
  );
};

/* ── Table.Header (column header cell) ─────────────────────── */
Table.Header = function TableHeader({
  children,
  sortable = false,
  onSort,
  sortDirection = null,  // 'asc' | 'desc' | null
  numeric = false,
  className = '',
}) {
  const handleClick = () => {
    if (sortable && onSort) onSort();
  };

  return (
    <th
      onClick={sortable ? handleClick : undefined}
      className={[
        'px-4 py-3',
        'text-swiss-gray-400',
        'font-bold uppercase',
        // Tracking is applied inline due to custom value
        sortable ? 'cursor-pointer hover:text-swiss-black' : '',
        numeric ? 'text-right' : 'text-left',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        fontSize: '11px',
        letterSpacing: '0.08em',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <span
        className={[
          'inline-flex items-center gap-1',
          // Active sort: red underline
          sortDirection ? 'border-b-2 border-swiss-red pb-0.5' : '',
        ].filter(Boolean).join(' ')}
      >
        {children}
        {sortable && (
          <span className="inline-flex flex-col" style={{ gap: '1px' }}>
            <ChevronUp
              size={10}
              strokeWidth={2}
              className={sortDirection === 'asc' ? 'text-swiss-red' : 'text-swiss-gray-400'}
            />
            <ChevronDown
              size={10}
              strokeWidth={2}
              className={sortDirection === 'desc' ? 'text-swiss-red' : 'text-swiss-gray-400'}
            />
          </span>
        )}
      </span>
    </th>
  );
};

/* ── Table.Cell (data cell) ─────────────────────────────────── */
Table.Cell = function TableCell({
  children,
  numeric = false,
  actions = false,
  className = '',
}) {
  return (
    <td
      className={[
        'px-4 py-4',
        'text-swiss-black',
        'align-middle',
        numeric ? 'text-right swiss-numeric' : '',
        actions ? 'text-right' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        fontSize: '14px',
        letterSpacing: '0.01em',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {actions ? (
        <div className="flex items-center justify-end gap-4">
          {children}
        </div>
      ) : children}
    </td>
  );
};

/* ── ActionLink (helper for table action cells) ─────────────── */
export const ActionLink = ({ children, destructive = false, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={[
      'font-bold uppercase cursor-pointer bg-transparent border-0',
      'transition-colors duration-fast',
      destructive
        ? 'text-swiss-red hover:opacity-70'
        : 'text-swiss-black hover:text-swiss-gray-600',
      className,
    ].filter(Boolean).join(' ')}
    style={{ fontSize: '11px', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}
  >
    {children}
  </button>
);

export default Table;
