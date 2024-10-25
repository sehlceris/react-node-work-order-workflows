import { AppNode } from './types';

export const createNode = (
  id: string,
  position: { x: number; y: number },
): AppNode => ({
  id,
  type: 'appNode',
  position,
  data: {
    label: `Node ${id}`,
    isComplete: false,
    isActive: false,
  },
  origin: [0.5, 0.0],
});
