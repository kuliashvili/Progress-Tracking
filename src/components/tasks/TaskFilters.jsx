import React, { useState, useEffect, useCallback } from "react";
import {
  fetchDepartments,
  fetchPriorities,
  fetchEmployees,
} from "@/services/api";
import "./TaskFilters.css";

const TaskFilters = ({ onFilterChange }) => {
  const [departments, setDepartments] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    departments: [],
    priorities: [],
    employee: null,
  });

  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [tempDepartmentSelections, setTempDepartmentSelections] = useState([]);

  const handleFilterChange = useCallback(
    (newFilters) => {
      if (onFilterChange) {
        onFilterChange(newFilters);
      }
    },
    [onFilterChange]
  );

  const getSavedFilters = useCallback(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("taskFilters");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing saved filters", e);
        }
      }
    }

    return {
      departments: [],
      priorities: [],
      employee: null,
    };
  }, []);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        const [departmentsData, prioritiesData, employeesData] =
          await Promise.all([
            fetchDepartments(),
            fetchPriorities(),
            fetchEmployees(),
          ]);

        setDepartments(departmentsData);
        setPriorities(prioritiesData);
        setEmployees(employeesData);

        const savedFilters = getSavedFilters();
        if (savedFilters) {
          setFilters(savedFilters);
          setTempDepartmentSelections(savedFilters.departments || []);
          handleFilterChange(savedFilters);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading filter options:", error);
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, [getSavedFilters]);

  // Save filters to localStorage
  const saveFilters = (newFilters) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("taskFilters", JSON.stringify(newFilters));
    }
  };

  const toggleDepartmentDropdown = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const filterGroup = e.currentTarget.closest(".filter-group");

    // Toggle the 'open' class
    const isCurrentlyOpen = filterGroup.classList.contains("open");

    document.querySelectorAll(".filter-group.open").forEach((group) => {
      if (group !== filterGroup) {
        group.classList.remove("open");
      }
    });

    filterGroup.classList.toggle("open");

    setShowDepartmentDropdown(!isCurrentlyOpen);
    if (!isCurrentlyOpen) {
      setTempDepartmentSelections([...filters.departments]);
    }
  };

  const handleDepartmentTempChange = (e) => {
    if (e) {
      e.stopPropagation();
    }

    const departmentId = e.target.value;
    const isChecked = e.target.checked;

    setTempDepartmentSelections((prev) => {
      if (isChecked) {
        if (prev.includes(departmentId)) return prev;
        return [...prev, departmentId];
      } else {
        return prev.filter((id) => id !== departmentId);
      }
    });
  };

  const applyDepartmentFilter = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const updatedFilters = {
      ...filters,
      departments: [...tempDepartmentSelections],
    };

    setFilters(updatedFilters);
    saveFilters(updatedFilters);
    handleFilterChange(updatedFilters);

    const filterGroup = e.currentTarget.closest(".filter-group");
    if (filterGroup) {
      filterGroup.classList.remove("open");
    }

    setShowDepartmentDropdown(false);
  };

  const handlePriorityChange = (e) => {
    const priorityId = e.target.value;
    const isChecked = e.target.checked;

    let updatedPriorities;
    if (isChecked) {
      updatedPriorities = [...filters.priorities, priorityId];
    } else {
      updatedPriorities = filters.priorities.filter((id) => id !== priorityId);
    }

    const updatedFilters = {
      ...filters,
      priorities: updatedPriorities,
    };

    setFilters(updatedFilters);
    saveFilters(updatedFilters);
    handleFilterChange(updatedFilters);
  };

  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value === "all" ? null : e.target.value;

    const updatedFilters = {
      ...filters,
      employee: employeeId,
    };

    setFilters(updatedFilters);
    saveFilters(updatedFilters);
    handleFilterChange(updatedFilters);
  };

  const toggleDropdown = (e) => {
    if (e) {
      e.stopPropagation();
    }

    const filterGroup = e.currentTarget.closest(".filter-group");
    filterGroup.classList.toggle("open");

    if (showDepartmentDropdown) {
      const departmentGroup = document.querySelector(
        ".filter-group:first-child"
      );
      if (departmentGroup) {
        departmentGroup.classList.remove("open");
      }
      setShowDepartmentDropdown(false);
    }

    document.querySelectorAll(".filter-group.open").forEach((group) => {
      if (group !== filterGroup) {
        group.classList.remove("open");
      }
    });
  };

  return (
    <div className="task-filters">
      <div className="filter-groups">
        <div className="filter-group">
          <div
            className="filter-group-header"
            onClick={toggleDepartmentDropdown}
          >
            <label>დეპარტამენტი</label>
            <button
              className={`filter-dropdown-toggle`}
              onClick={toggleDepartmentDropdown}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <div className="department-dropdown-panel">
            <div className="filter-checkboxes">
              {departments.map((department) => (
                <div className="filter-option" key={department.id}>
                  <input
                    type="checkbox"
                    id={`dept-${department.id}`}
                    value={department.id.toString()}
                    checked={tempDepartmentSelections.includes(
                      department.id.toString()
                    )}
                    onChange={handleDepartmentTempChange}
                  />
                  <label htmlFor={`dept-${department.id}`}>
                    {department.name}
                  </label>
                </div>
              ))}
            </div>
            <button
              className="department-select-btn"
              onClick={applyDepartmentFilter}
            >
              არჩევა
            </button>
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-group-header" onClick={toggleDropdown}>
            <label>პრიორიტეტი</label>
            <button className={`filter-dropdown-toggle`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          <div className="filter-dropdown">
            <div className="filter-checkboxes">
              {priorities.map((priority) => (
                <div className="filter-option" key={priority.id}>
                  <input
                    type="checkbox"
                    id={`priority-${priority.id}`}
                    value={priority.id.toString()}
                    checked={filters.priorities.includes(
                      priority.id.toString()
                    )}
                    onChange={handlePriorityChange}
                  />
                  <label htmlFor={`priority-${priority.id}`}>
                    {priority.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-group-header" onClick={toggleDropdown}>
            <label>თანამშრომელი</label>
            <button
              className={`filter-dropdown-toggle ${
                filters.employee ? "active" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          <div className="filter-dropdown">
            <div className="filter-options">
              <div className="filter-radio">
                <input
                  type="radio"
                  id="employee-all"
                  name="employee"
                  value="all"
                  checked={!filters.employee}
                  onChange={handleEmployeeChange}
                />
                <label htmlFor="employee-all">ყველა თანამშრომელი</label>
              </div>

              {employees.map((employee) => (
                <div className="filter-radio employee-option" key={employee.id}>
                  <input
                    type="radio"
                    id={`employee-${employee.id}`}
                    name="employee"
                    value={employee.id.toString()}
                    checked={filters.employee === employee.id.toString()}
                    onChange={handleEmployeeChange}
                  />
                  <label
                    htmlFor={`employee-${employee.id}`}
                    className="employee-label"
                  >
                    {employee.avatar && (
                      <div className="employee-avatar-container">
                        <img
                          src={employee.avatar}
                          alt={`${employee.name} ${employee.surname}`}
                          width={24}
                          height={24}
                          className="employee-avatar"
                        />
                      </div>
                    )}
                    <span>
                      {employee.name} {employee.surname}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
