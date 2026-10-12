export type OwnerKind = 'project' | 'group';

export interface ItemOwner {
  kind: OwnerKind;
  id: string;
}

export interface MoveOption {
  key: string;
  label: string;
  target: { projectId: string } | { groupId: string };
}
