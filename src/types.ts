import { Node } from '@xyflow/react';
export type AppNode = Node<
  { label: string; onRemove?: (id: string) => void },
  'appNode'
>;
