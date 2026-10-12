'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { AUTH_COPY } from '@/constants/auth';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean;
}

export function PasswordInput(props: Props) {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <Input
      {...props}
      type={isVisible ? 'text' : 'password'}
      icon={<Lock size={15} />}
      trailing={
        <IconButton
          size="sm"
          label={isVisible ? AUTH_COPY.hidePassword : AUTH_COPY.showPassword}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((value) => !value)}
        >
          {isVisible ? <EyeOff size={15} /> : <Eye size={15} />}
        </IconButton>
      }
    />
  );
}
