import React from "react";
import TaskCard from "./TaskCard";
import "./TaskColumn.css";

const TaskColumn = ({ title, tasks }) => {
  return (
    <div className="task-column">
      <div className="task-column-header">
        <h2>{title}</h2>
      </div>
      <div className="task-list">
        {tasks.length > 0 &&
          tasks.map((task) => <TaskCard key={task.id} task={task} />)}
      </div>
    </div>
  );
};

export default TaskColumn;
