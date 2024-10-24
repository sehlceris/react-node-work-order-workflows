import { AppNode } from './types';

export const initialNodes: AppNode[] = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { label: 'Node 1' },
    type: 'appNode',
  },
  {
    id: '2',
    position: { x: 0, y: 100 },
    data: { label: 'Node 2' },
    type: 'appNode',
  },
];
export const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
