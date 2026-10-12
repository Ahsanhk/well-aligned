export function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function hasModifier(event: KeyboardEvent | React.KeyboardEvent) {
  return event.metaKey || event.ctrlKey;
}
