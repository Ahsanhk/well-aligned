'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HiddenFileInput } from '@/components/ui/HiddenFileInput';
import { IMPORT_ACCEPT, ROUTES } from '@/constants/app';
import { TOAST_COPY } from '@/constants/toast';
import { useFilePicker } from '@/hooks/useFilePicker';
import { parseProjectExport } from '@/lib/json';
import { useProjectsStore } from '@/store/projects';
import { toastError, toastSuccess } from '@/store/toast';

export function ImportProjectButton() {
  const router = useRouter();
  const importProject = useProjectsStore((state) => state.importProject);
  const [isImporting, setIsImporting] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const data = parseProjectExport(await files[0].text());
      if (!data) {
        toastError(TOAST_COPY.importInvalid);
        return;
      }
      setIsImporting(true);
      const project = await importProject(data);
      setIsImporting(false);
      if (!project) return;
      toastSuccess(TOAST_COPY.projectImported);
      router.push(ROUTES.project(project.id));
    },
    [importProject, router],
  );

  const { inputRef, openPicker, onChange } = useFilePicker(handleFiles);

  return (
    <>
      <Button variant="secondary" onClick={openPicker} disabled={isImporting}>
        <FileUp size={15} />
        {isImporting ? 'Importing…' : 'Import JSON'}
      </Button>
      <HiddenFileInput ref={inputRef} accept={IMPORT_ACCEPT} onChange={onChange} />
    </>
  );
}
