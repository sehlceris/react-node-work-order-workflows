import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useEdgesState,
  useNodesState,
  BackgroundVariant,
  useReactFlow,
  ReactFlowInstance,
  Edge,
  addEdge,
  Connection,
  OnConnect,
  ConnectionState,
  OnConnectEnd,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { AppNode } from './types';
import { AppCustomNode } from './AppCustomNode';

const flowKey = 'react-flow-persistence';

export const FlowChart = () => {
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const { setViewport, screenToFlowPosition } = useReactFlow();

  const createOnLabelChange = useCallback(
    (nodeId: string) => (label: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, label } } : n,
        ),
      );
    },
    [setNodes],
  );

  const createNode = useCallback(
    (id: string, position: { x: number; y: number }): AppNode => ({
      id,
      type: 'appNode',
      position,
      data: {
        label: `Node ${id}`,
        onLabelChange: createOnLabelChange(id),
      },
      origin: [0.5, 0.0],
    }),
    [createOnLabelChange],
  );

  const onAddNode = useCallback(() => {
    const newNode = createNode(`${nodes.length + 1}`, { x: 0, y: 0 });
    setNodes((nds) => nds.concat(newNode));
  }, [nodes.length, createNode, setNodes]);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const storedFlow = localStorage.getItem(flowKey);
      const flow = storedFlow ? JSON.parse(storedFlow) : null;

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        const restoredNodes = flow.nodes.map((node: AppNode) => ({
          ...node,
          data: {
            ...node.data,
            onLabelChange: createOnLabelChange(node.id),
          },
        }));
        setNodes(restoredNodes);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setEdges, setNodes, setViewport, createOnLabelChange]);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState: ConnectionState) => {
      if (!connectionState.isValid) {
        const id = `${nodes.length + 1}`;
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;
        const newNode = createNode(
          id,
          screenToFlowPosition({ x: clientX, y: clientY }),
        );

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id, source: connectionState.fromNode!.id, target: id }),
        );
      }
    },
    [nodes.length, screenToFlowPosition, setNodes, setEdges, createNode],
  );

  // save flow upon update
  useEffect(() => {
    onSave();
  }, [nodes, edges, onSave]);

  // restore flow on mount
  useEffect(() => {
    onRestore();
  }, [onRestore]);

  return (
    <div className="w-full h-full">
      <div className="w-full h-full">
        <ReactFlow
          onInit={setRfInstance}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          nodeTypes={{
            appNode: AppCustomNode,
          }}
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>

      <button
        onClick={onAddNode}
        className="absolute top-4 right-4 w-8 h-8 bg-blue-500 text-white rounded-full items-center justify-center"
      >
        +
      </button>
    </div>
  );
};
