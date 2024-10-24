import { Handle, NodeProps, Position } from '@xyflow/react';
import { AppNode } from './types';

export const AppCustomNode = ({ id, data }: NodeProps<AppNode>) => (
  <div
    className={`relative bg-white border-8 rounded p-2 ${
      data.isActive ? 'border-yellow-400' : 'border-gray-300'
    }`}
  >
    <input
      type="text"
      value={data.label}
      onChange={(evt) => data.onLabelChange?.(id, evt.target.value)}
    />
    <div className="controls flex justify-between mt-2">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={data.isComplete}
          onChange={() => data.onStatusChange?.(id, !data.isComplete)}
        />
        <span className="ml-2">Done</span>
      </label>
      <button className="text-red-500" onClick={() => data.onDelete?.(id)}>
        Delete
      </button>
    </div>
    <Handle type="target" position={Position.Left} id={`${id}-target`} />
    <Handle type="source" position={Position.Right} id={`${id}-source`} />
  </div>
);
