import { useCallback, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useEdgesState,
  addEdge,
  useNodesState,
  Connection,
  BackgroundVariant,
  Node,
  NodeProps,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export const CustomNode = ({ id, data }: NodeProps) => (
  <div className="relative bg-white border border-gray-300 rounded p-2">
    <button
      className="absolute top-0 right-0 text-red-500 font-bold"
      onClick={() => data.onRemove(id)}
    >
      X
    </button>
    {data.label}
  </div>
);

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onAddNode = useCallback(() => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      data: { label: `Node ${nodes.length + 1}` },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const newLabel = prompt("Enter new label:", node.data.label);
      if (newLabel) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n
          )
        );
      }
    },
    [setNodes]
  );

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <h1>Workflow Editor</h1>
      <button onClick={onAddNode} className="mb-4 p-2 bg-blue-500 text-white rounded">
        Add Node
      </button>
      <div className="mt-4 flex-auto border border-gray-200 rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          deleteKeyCode="Delete"
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
