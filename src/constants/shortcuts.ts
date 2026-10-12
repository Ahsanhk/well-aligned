export const SHORTCUTS = {
  submit: { key: 'Enter', mod: true, label: ['⌘', '↵'] },
  focusComposer: { key: 'n', mod: false, label: ['N'] },
  generatePrompt: { key: 'g', mod: false, label: ['G'] },
  clearSelection: { key: 'Escape', mod: false, label: ['Esc'] },
  lightboxPrev: { key: 'ArrowLeft', mod: false, label: ['←'] },
  lightboxNext: { key: 'ArrowRight', mod: false, label: ['→'] },
} as const;
