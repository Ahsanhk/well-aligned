import type { ChangeEvent, Ref } from 'react';

interface Props {
  ref: Ref<HTMLInputElement>;
  accept: string;
  multiple?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function HiddenFileInput({ ref, accept, multiple = false, onChange }: Props) {
  return <input ref={ref} type="file" accept={accept} multiple={multiple} onChange={onChange} className="hidden" tabIndex={-1} />;
}
