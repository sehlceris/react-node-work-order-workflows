import { Handle, NodeProps, Position } from '@xyflow/react';
import { AppNode } from './types';

export const AppCustomNode = ({ id, data }: NodeProps<AppNode>) => (
  <div className="relative bg-white border border-gray-300 rounded p-2">
    <input
      type="text"
      value={data.label}
      onChange={(evt) => data.onLabelChange?.(evt.target.value)}
    />
    <div className="controls flex justify-between mt-2">
      <label className="flex items-center">
        <input
          type="checkbox"
          defaultChecked={data.isComplete}
          onChange={() => data.onStatusChange?.(!data.isComplete)}
        />
        <span className="ml-2">Done</span>
      </label>
      <button className="text-red-500" onClick={() => data.onDelete?.()}>
        Delete
      </button>
    </div>
    <Handle type="target" position={Position.Left} id={`${id}-target`} />
    <Handle type="source" position={Position.Right} id={`${id}-source`} />
  </div>
);
