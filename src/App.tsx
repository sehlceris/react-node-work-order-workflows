import '@xyflow/react/dist/style.css';
import { FlowChart } from './FlowChart';

export default function App() {
  return (
    <div className="w-full h-full p-4 flex flex-col">
      <h1>Workflow Editor</h1>
      <FlowChart />
    </div>
  );
}
