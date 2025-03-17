"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  fetchStatuses,
  fetchPriorities,
  fetchDepartments,
  fetchEmployeesByDepartment,
  createTask,
} from "@/services/api";
import EmployeeModal from "@/components/employees/EmployeeModal";
import "./page.css";
import highIcon from "../../../../public/images/high.svg";
import lowIcon from "../../../../public/images/low.svg";
import mediumIcon from "../../../../public/images/medium.svg";

export default function CreateTaskPage() {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status_id: "",
    priority_id: "",
    department_id: "",
    employee_id: "",
    due_date: "",
  });

  // Page state
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Validation state
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  // Load necessary data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusesData, prioritiesData, departmentsData] =
          await Promise.all([
            fetchStatuses(),
            fetchPriorities(),
            fetchDepartments(),
          ]);

        setStatuses(statusesData);
        setPriorities(prioritiesData);
        setDepartments(departmentsData);

        // default values for select fields
        setFormData((prev) => ({
          ...prev,
          status_id:
            statusesData.find(
              (status) =>
                status.name.includes("დასაწყები") ||
                status.name.includes("Todo")
            )?.id ||
            statusesData[0]?.id ||
            "",
          priority_id:
            prioritiesData.find(
              (priority) =>
                priority.name.includes("საშუალო") ||
                priority.name.includes("Medium")
            )?.id ||
            prioritiesData[1]?.id ||
            "",
          due_date: getTomorrowDate(),
        }));

        setLoading(false);
      } catch (err) {
        console.error("Failed to load form data:", err);
        setError("მონაცემების ჩატვირთვა ვერ მოხერხდა");
        setLoading(false);
      }
    };

    // saved form data if it exists
    const savedFormData = getSavedFormData();
    if (savedFormData) {
      setFormData(savedFormData);
    }

    fetchData();
  }, []);

  // If department changes, fetch employees for that department
  useEffect(() => {
    if (formData.department_id) {
      const loadEmployees = async () => {
        try {
          const employeesData = await fetchEmployeesByDepartment(
            formData.department_id
          );
          setEmployees(employeesData);
        } catch (err) {
          console.error("Failed to load employees:", err);
        }
      };

      loadEmployees();
    }
  }, [formData.department_id]);

  // Save form data to localStorage when it changes
  useEffect(() => {
    saveFormData(formData);
  }, [formData]);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Save form data to localStorage
  const saveFormData = (data) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("taskFormData", JSON.stringify(data));
    }
  };

  // Get saved form data from localStorage
  const getSavedFormData = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("taskFormData");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing saved form data", e);
        }
      }
    }
    return null;
  };

  // Clear form data from localStorage
  const clearSavedFormData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("taskFormData");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "department_id" && value !== formData.department_id) {
      setFormData((prev) => ({ ...prev, [name]: value, employee_id: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setTouched((prev) => ({ ...prev, [name]: true }));

    validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "name":
        if (!value) error = "სათაური აუცილებელია";
        else if (value.length < 3) error = "მინიმუმ 3 სიმბოლო";
        else if (value.length > 255) error = "მაქსიმუმ 255 სიმბოლო";
        break;

      case "description":
        if (value) {
          const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
          if (wordCount < 4) error = "მინიმუმ 4 სიტყვა";
          if (value.length > 255) error = "მაქსიმუმ 255 სიმბოლო";
        }
        break;

      case "priority_id":
      case "status_id":
      case "department_id":
        if (!value) error = "ეს ველი აუცილებელია";
        break;

      case "employee_id":
        if (formData.department_id && !value) error = "აირჩიეთ თანამშრომელი";
        break;

      case "due_date":
        if (!value) error = "თარიღი აუცილებელია";
        else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDate < today) {
            error = "წარსული თარიღი არ დაიშვება";
          }
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  // Validate all form fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    for (const [fieldName, fieldValue] of Object.entries(formData)) {
      if (fieldName === "description" && !fieldValue) continue;

      const error = validateField(fieldName, fieldValue);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);

    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

    setTouched(allTouched);

    return isValid;
  };

  // form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await createTask(formData);

      if (response) {
        // Clear saved form data on successful submission
        clearSavedFormData();

        // Redirect to the tasks list page
        router.push("/");
      }
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("დავალების შექმნა ვერ მოხერხდა");
    } finally {
      setSubmitting(false);
    }
  };

  const openEmployeeModal = () => {
    setIsEmployeeModalOpen(true);
  };

  const closeEmployeeModal = () => {
    setIsEmployeeModalOpen(false);
  };

  const handleEmployeeCreated = async (newEmployee) => {
    if (newEmployee.department_id.toString() === formData.department_id) {
      setEmployees((prev) => [...prev, newEmployee]);
      setFormData((prev) => ({
        ...prev,
        employee_id: newEmployee.id.toString(),
      }));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>იტვირთება...</p>
      </div>
    );
  }

  if (error) {
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
  }

  return (
    <div className="create-task-page">
      <div className="create-task-header">
        <h1>შექმენი ახალი დავალება</h1>
      </div>

      <form className="create-task-form" onSubmit={handleSubmit}>
        <div className="form-columns">
          <div className="form-column left-column">
            <div className="form-group">
              <label htmlFor="name">სათაური*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.name && touched.name ? "error" : ""}
              />
              <div className="validation-indicators">
                <div
                  className={`validation-item ${
                    !touched.name
                      ? ""
                      : formData.name.length >= 3
                      ? "valid"
                      : "invalid"
                  }`}
                >
                  <span className="check-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.3334 4L6.00008 11.3333L2.66675 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>მინიმუმ 3 სიმბოლო</span>
                </div>
                <div
                  className={`validation-item ${
                    !touched.name
                      ? ""
                      : formData.name.length <= 255
                      ? "valid"
                      : "invalid"
                  }`}
                >
                  <span className="check-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.3334 4L6.00008 11.3333L2.66675 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>მაქსიმუმ 255 სიმბოლო</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">აღწერა</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  errors.description && touched.description ? "error" : ""
                }
              />
              <div className="validation-indicators">
                <div
                  className={`validation-item ${
                    !touched.description || !formData.description
                      ? ""
                      : formData.description.trim().split(/\s+/).filter(Boolean)
                          .length >= 4
                      ? "valid"
                      : "invalid"
                  }`}
                >
                  <span className="check-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.3334 4L6.00008 11.3333L2.66675 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>მინიმუმ 4 სიტყვა</span>
                </div>
                <div
                  className={`validation-item ${
                    !touched.description || !formData.description
                      ? ""
                      : formData.description.length <= 255
                      ? "valid"
                      : "invalid"
                  }`}
                >
                  <span className="check-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.3334 4L6.00008 11.3333L2.66675 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>მაქსიმუმ 255 სიმბოლო</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="priority_id">პრიორიტეტი*</label>
              <select
                id="priority_id"
                name="priority_id"
                value={formData.priority_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  errors.priority_id && touched.priority_id ? "error" : ""
                }
              >
                <option value="">აირჩიეთ პრიორიტეტი</option>
                {priorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status_id">სტატუსი*</label>
              <select
                id="status_id"
                name="status_id"
                value={formData.status_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.status_id && touched.status_id ? "error" : ""}
              >
                <option value="">აირჩიეთ სტატუსი</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-column right-column">
            <div className="form-group">
              <label htmlFor="department_id">დეპარტამენტი</label>
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  errors.department_id && touched.department_id ? "error" : ""
                }
              >
                <option value="">აირჩიეთ დეპარტამენტი</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            {/* employee field - only show if department is selected */}
            {formData.department_id && (
              <div className="form-group">
                <label htmlFor="employee_id">პასუხისმგებელი თანამშრომელი</label>
                <div className="employee-select-container">
                  <select
                    id="employee_id"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={
                      errors.employee_id && touched.employee_id ? "error" : ""
                    }
                  >
                    <option value="">აირჩიეთ თანამშრომელი</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} {employee.surname}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="add-employee-button"
                    onClick={openEmployeeModal}
                  >
                    + დაამატე თანამშრომელი
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="due_date">დედლაინი</label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                min={getTomorrowDate()}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.due_date && touched.due_date ? "error" : ""}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? "დამუშავება..." : "დავალების შექმნა"}
          </button>
        </div>
      </form>

      {isEmployeeModalOpen && (
        <EmployeeModal
          isOpen={isEmployeeModalOpen}
          onClose={closeEmployeeModal}
          onEmployeeCreated={handleEmployeeCreated}
        />
      )}
    </div>
  );
}
