'use client';

import { useState } from 'react';
import { Card, Select, Button, Space } from 'antd';
import { Gantt, Task, ViewMode, EventOption, StylingOption } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";

interface GanttChartProps {
  tasks: Task[];
  projectId?: number;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, projectId }) => {
  const [view, setView] = useState<ViewMode>(ViewMode.Month);
  
  const handleViewChange = (value: string) => {
    setView(value as ViewMode);
  };

  return (
    <Card 
      title="專案時間線" 
      className="gantt-container"
      extra={
        <Space>
          <Select
            defaultValue={ViewMode.Month}
            style={{ width: 120 }}
            onChange={handleViewChange}
            options={[
              { value: ViewMode.Day, label: '日視圖' },
              { value: ViewMode.Week, label: '週視圖' },
              { value: ViewMode.Month, label: '月視圖' },
              { value: ViewMode.Year, label: '年視圖' },
            ]}
          />
          <Button type="link" onClick={() => window.print()}>
            列印
          </Button>
        </Space>
      }
    >
      <div className="gantt-chart">
        <Gantt
          tasks={tasks}
          viewMode={view}
          onDateChange={(task: Task) => console.log("Date change", task)}
          onProgressChange={(task: Task) => console.log("Progress change", task)}
          onDoubleClick={(task: Task) => console.log("Double click", task)}
          onClick={(task: Task) => console.log("Click", task)}
          listCellWidth="200px" // 設定任務列表的寬度，讓名稱完整顯示
          columnWidth={60}
          locale="zh-TW"
        />
      </div>
    </Card>
  );
};

export default GanttChart;
