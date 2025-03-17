"use client";

import React, { useState, useEffect } from "react";
import { fetchTasks, fetchStatuses } from "@/services/api";
import TaskColumn from "@/components/tasks/TaskColumn";
import TaskFilters from "@/components/tasks/TaskFilters";
import "./page.css";

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tasksData, statusesData] = await Promise.all([
          fetchTasks(),
          fetchStatuses(),
        ]);

        setAllTasks(tasksData);
        setFilteredTasks(tasksData);
        setStatuses(statusesData);
        setLoading(false);
      } catch (err) {
        setError("მონაცემების ჩატვირთვა ვერ მოხერხდა");
        setLoading(false);
        console.error(err);
      }
    };
    loadData();
  }, []);

  const handleFilterChange = (filters) => {
    if (
      !filters.departments.length &&
      !filters.priorities.length &&
      !filters.employee
    ) {
      setFilteredTasks(allTasks);
      return;
    }

    const filtered = allTasks.filter((task) => {
      // Department filter 
      const departmentMatch =
        filters.departments.length === 0 ||
        filters.departments.includes(task.department?.id?.toString());

      // Priority filter 
      const priorityMatch =
        filters.priorities.length === 0 ||
        filters.priorities.includes(task.priority?.id?.toString());

      // Employee filter 
      const employeeMatch =
        !filters.employee || task.employee?.id?.toString() === filters.employee;

      return departmentMatch && priorityMatch && employeeMatch;
    });

    setFilteredTasks(filtered);
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>იტვირთება...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <p>{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          ხელახლა ცდა
        </button>
      </div>
    );

  // Group tasks by status 
  const tasksByStatus = statuses.reduce((acc, status) => {
    acc[status.id] = filteredTasks.filter(
      (task) => task.status?.id === status.id
    );
    return acc;
  }, {});

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>დავალებების გვერდი</h1>
      </div>

      <TaskFilters onFilterChange={handleFilterChange} />

      <div className="task-columns">
        {statuses.map((status) => (
          <TaskColumn
            key={status.id}
            title={status.name}
            tasks={tasksByStatus[status.id] || []}
          />
        ))}
      </div>
    </div>
  );
}
