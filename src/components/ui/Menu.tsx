'use client';

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MENU_OFFSET_PX, MENU_WIDTH_PX, VIEWPORT_MARGIN_PX } from '@/constants/menu';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { cn } from '@/lib/cn';

type Placement = 'bottom-end' | 'top-start';

const PLACEMENTS: Record<Placement, string> = {
  'bottom-end': 'top-full right-0 mt-1.5 w-52',
  'top-start': 'bottom-full left-0 right-0 mb-1.5',
};

const PANEL_CLASS =
  'animate-pop-in z-50 overflow-hidden rounded-xl border border-line-strong bg-elevated p-1 shadow-2xl shadow-black/50';

interface Props {
  placement?: Placement;
  portal?: boolean;
  className?: string;
  trigger: (props: { isOpen: boolean; toggle: () => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
}

function fixedPosition(anchor: HTMLElement, panelHeight: number): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  const left = Math.min(
    Math.max(VIEWPORT_MARGIN_PX, rect.right - MENU_WIDTH_PX),
    window.innerWidth - MENU_WIDTH_PX - VIEWPORT_MARGIN_PX,
  );
  const spaceBelow = window.innerHeight - rect.bottom - MENU_OFFSET_PX - VIEWPORT_MARGIN_PX;
  const spaceAbove = rect.top - MENU_OFFSET_PX - VIEWPORT_MARGIN_PX;
  const opensUp = panelHeight > spaceBelow && spaceAbove > spaceBelow;
  const maxHeight = Math.max(opensUp ? spaceAbove : spaceBelow, 0);
  const base: CSSProperties = { position: 'fixed', left, width: MENU_WIDTH_PX, maxHeight, overflowY: 'auto' };
  return opensUp
    ? { ...base, bottom: window.innerHeight - rect.top + MENU_OFFSET_PX }
    : { ...base, top: rect.bottom + MENU_OFFSET_PX };
}

export function Menu({ trigger, children, placement = 'bottom-end', portal = false, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => [ref, panelRef], []);
  const { isOpen, close, toggle } = useDisclosure();
  const [style, setStyle] = useState<CSSProperties | undefined>(undefined);
  useClickOutside(refs, close, isOpen);
  useEscapeKey(close, isOpen);

  useLayoutEffect(() => {
    if (!isOpen || !portal || !ref.current) return;
    setStyle({ ...fixedPosition(ref.current, 0), visibility: 'hidden' });
    const onScroll = () => close();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      setStyle(undefined);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [isOpen, portal, close]);

  useLayoutEffect(() => {
    if (!isOpen || !portal || !ref.current || !panelRef.current || !style || style.visibility !== 'hidden') return;
    setStyle(fixedPosition(ref.current, panelRef.current.scrollHeight));
  }, [isOpen, portal, style]);

  const panel = (
    <div
      ref={panelRef}
      role="menu"
      style={portal ? style : undefined}
      className={cn(PANEL_CLASS, !portal && cn('absolute', PLACEMENTS[placement]))}
    >
      {children(close)}
    </div>
  );

  return (
    <div ref={ref} className={cn('relative', className)}>
      {trigger({ isOpen, toggle })}
      {isOpen && (portal ? style && createPortal(panel, document.body) : panel)}
    </div>
  );
}
