import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Structured Warmth — Table Primitive Component System
 *
 * All sub-components are attached to Table namespace: Head, Body, Row, Header, Cell.
 *
 * Rules:
 *   - Header row: Background #F0F4F7, separator 1px solid #DDE3EA.
 *   - Column headers: uppercase, tracked, neutral-500 (600 weight).
 *   - Rows: Background #FFFFFF, separator 1px solid #F0F4F7, height 56px.
 *   - Row hover: Subtle neutral-50 background.
 *   - Action links: Medium weight (Inter 500), 13px, title-cased.
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
      className="bg-neutral-100"
      style={{ borderBottom: '1px solid #DDE3EA' }}
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
  selected = false,
  danger = false,
  className = '',
}) {
  const getBackgroundClass = () => {
    if (selected) return 'bg-[#EFF6FF]'; // Light primary tint
    if (danger) return 'bg-danger/[0.03]'; // Subliminal red tint
    if (expanded) return 'bg-[#F7F9FB]'; // Continuation background
    return 'bg-white';
  };

  const getBorderLeft = () => {
    if (selected || expanded) return '4px solid #0B4F6C'; // 4px primary left border
    return 'none';
  };

  return (
    <tr
      onClick={onClick}
      className={[
        'transition-all duration-fast ease-swiss',
        'border-b border-neutral-100',
        getBackgroundClass(),
        hoverable && !selected && !expanded ? 'hover:bg-neutral-50' : '',
        onClick ? 'cursor-pointer' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        height: '52px',
        borderLeft: getBorderLeft(),
      }}
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
        'text-neutral-500',
        'font-medium uppercase',
        sortable ? 'cursor-pointer hover:text-neutral-900' : '',
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
          sortDirection ? 'border-b-2 border-accent pb-0.5' : '',
        ].filter(Boolean).join(' ')}
      >
        {children}
        {sortable && (
          <span className="inline-flex flex-col" style={{ gap: '1px' }}>
            <ChevronUp
              size={10}
              strokeWidth={2}
              className={sortDirection === 'asc' ? 'text-accent' : 'text-neutral-300'}
            />
            <ChevronDown
              size={10}
              strokeWidth={2}
              className={sortDirection === 'desc' ? 'text-accent' : 'text-neutral-300'}
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
        'px-4 py-0',
        'text-neutral-900',
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
      'font-medium cursor-pointer bg-transparent border-0',
      'transition-colors duration-fast hover:underline',
      destructive
        ? 'text-danger'
        : 'text-primary',
      className,
    ].filter(Boolean).join(' ')}
    style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif' }}
  >
    {children}
  </button>
);

export default Table;
export { Table };
