'use client';

import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { Button } from './Button';

interface Props {
  text: string;
  label?: string;
  copiedLabel?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CopyButton({ text, label = 'Copy', copiedLabel = 'Copied', variant = 'secondary', size = 'sm', className }: Props) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <Button variant={variant} size={size} className={className} onClick={() => void copy(text)} disabled={!text}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
