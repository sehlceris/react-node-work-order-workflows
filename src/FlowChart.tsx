import { useCallback, useEffect, useRef, useState } from 'react';
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
  const initialized = useRef(false);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const { setViewport, screenToFlowPosition, deleteElements } = useReactFlow();

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

  const createOnStatusChange = useCallback(
    (nodeId: string) => (isComplete: boolean) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, isComplete } } : n,
        ),
      );
    },
    [setNodes],
  );

  const createOnDelete = useCallback(
    (id: string) => () => {
      console.log('deleteElement', id);
      deleteElements({
        nodes: [
          {
            id,
          },
        ],
      });
    },
    [deleteElements],
  );

  const createNode = useCallback(
    (id: string, position: { x: number; y: number }): AppNode => ({
      id,
      type: 'appNode',
      position,
      data: {
        label: `Node ${id}`,
        isComplete: false,
        onLabelChange: createOnLabelChange(id),
        onStatusChange: createOnStatusChange(id),
        onDelete: createOnDelete(id),
      },
      origin: [0.5, 0.0],
    }),
    [createOnLabelChange, createOnStatusChange, createOnDelete],
  );

  const onResetNodeCompletion = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, isComplete: false } })),
    );
  }, [setNodes]);

  useEffect(() => {
    console.log('nodes', nodes);
  }, [nodes]);

  const onAddNode = useCallback(() => {
    const newNode = createNode(`${nodes.length + 1}`, { x: 0, y: 0 });
    setNodes((nds) => nds.concat(newNode));
  }, [nodes.length, createNode, setNodes]);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      console.log('onSave', flow);
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    console.log('restoreFlow');
    const storedFlow = localStorage.getItem(flowKey);
    const flow = storedFlow ? JSON.parse(storedFlow) : null;

    if (flow) {
      const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      const restoredNodes = flow.nodes.map((node: AppNode) => ({
        ...node,
        data: {
          ...node.data,
          onLabelChange: createOnLabelChange(node.id),
          onStatusChange: createOnStatusChange(node.id),
          onDelete: createOnDelete(node.id),
        },
      }));
      setNodes(restoredNodes);
      setEdges(flow.edges || []);
      setViewport({ x, y, zoom });
    }
  }, [
    setNodes,
    setEdges,
    setViewport,
    createOnLabelChange,
    createOnStatusChange,
    createOnDelete,
  ]);

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
    if (initialized.current) {
      onSave();
    }
  }, [nodes, edges, onSave]);

  // restore flow on mount
  useEffect(() => {
    if (!initialized.current && onRestore) {
      initialized.current = true;
      onRestore();
    }
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

      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={onResetNodeCompletion}
          className="w-8 h-8 bg-green-500 text-white rounded-full items-center justify-center"
        >
          {/* This is the reset button. Just imagine there's a nice FontAwesome icon here. */}
          RS
        </button>
        <button
          onClick={onAddNode}
          className="w-8 h-8 bg-blue-500 text-white rounded-full items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
};
