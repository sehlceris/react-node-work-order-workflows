import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowInstance,
  OnConnectEnd,
  NodeProps,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { AppNode, AppState } from './types';
import { AppCustomNode } from './AppCustomNode';

const flowKey = 'react-flow-persistence';

import { useStore } from './store';
import { useShallow } from 'zustand/shallow';
import { createNode } from './util';

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  onStatusChange: state.onStatusChange,
  deleteNode: state.deleteNode,
});

export const FlowChart = () => {
  //   console.log('render');

  const initialized = useRef(false);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
    onStatusChange,
    deleteNode,
  } = useStore(useShallow(selector));

  const { setViewport, screenToFlowPosition } = useReactFlow();

  const onLabelChange = useCallback(
    (nodeId: string, label: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, label } } : n,
        ),
      );
    },
    [setNodes],
  );

  const onDelete = useCallback(
    (nodeId: string) => {
      console.log('deleteElement', nodeId);
      // setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      deleteNode(nodeId);
    },
    [deleteNode],
  );

  const onResetNodeCompletion = useCallback(() => {
    setNodes((nds) => {
      const result = nds.map((n) => ({
        ...n,
        data: { ...n.data, isComplete: false, isActive: false },
      }));
      console.log('reset nodes', nds, result);
      return result;
    });
  }, [setNodes]);

  const onAddNode = useCallback(() => {
    const newNode = createNode(`${nodes.length + 1}`, { x: 0, y: 0 });
    setNodes((nds) => nds.concat(newNode));
  }, [nodes.length, setNodes]);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      //   console.log('onSave', flow);
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
          onLabelChange,
          onStatusChange,
          onDelete,
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
    onLabelChange,
    onDelete,
    onStatusChange,
  ]);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      if (!connectionState.isValid) {
        const id = `${nodes.length + 1}`;
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;

        const position = screenToFlowPosition({ x: clientX, y: clientY });
        const newNode = createNode(id, position);

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id, source: connectionState.fromNode!.id, target: id }),
        );
      }
    },
    [nodes.length, setNodes, setEdges, screenToFlowPosition],
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

  const nodeTypes = useMemo(
    () => ({
      appNode: (props: NodeProps<AppNode>) => (
        <AppCustomNode
          {...props}
          onLabelChange={onLabelChange}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ),
    }),
    [onLabelChange, onStatusChange, onDelete],
  );

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
          nodeTypes={nodeTypes}
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
