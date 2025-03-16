import React from "react";
import { truncateText, formatDate } from "@/lib/utils";
import "./TaskCard.css";
import highIcon from "../../../public/images/high.svg";
import lowIcon from "../../../public/images/low.svg";
import mediumIcon from "../../../public/images/medium.svg";
import commentIcon from "../../../public/images/comment.svg";
import Image from "next/image";
import Link from "next/link";

const TaskCard = ({ task }) => {
  // Get task status class
  const getTaskStatusClass = (status) => {
    if (!status?.name) return "";

    const name = status.name.toLowerCase();
    if (name.includes("დასაწყები")) return "task-status-todo";
    if (name.includes("progres") || name.includes("პროგრეს"))
      return "task-status-progress";
    if (name.includes("ტესტირებ")) return "task-status-testing";
    if (name.includes("დასრულებ")) return "task-status-done";
    return "";
  };

  // Get priority class and icon
  const getPriorityClass = (priority) => {
    if (!priority?.name) return "priority-medium";

    const name = priority.name.toLowerCase();
    if (name.includes("დაბალი") || name.includes("low")) return "priority-low";
    if (name.includes("საშუალო") || name.includes("medium"))
      return "priority-medium";
    if (name.includes("მაღალი") || name.includes("high"))
      return "priority-high";
    return "priority-medium";
  };

  // department display and class
  const getDepartmentInfo = (department) => {
    if (!department?.name) return { display: "", className: "" };

    const name = department.name;
    if (name.includes("ადმინისტრაცი"))
      return {
        display: "ადმინისტრაცია",
        className: "department-administration",
      };
    if (name.includes("ადამიანური"))
      return { display: "HR", className: "department-hr" };
    if (name.includes("ფინანსებ"))
      return { display: "ფინანსები", className: "department-finance" };
    if (name.includes("გაყიდვები"))
      return { display: "გაყ. & მარკ.", className: "department-sales" };
    if (name.includes("ლოჯოსტიკ") || name.includes("ლოჯისტიკ"))
      return { display: "ლოჯისტიკა", className: "department-logistics" };
    if (name.includes("ტექნოლოგი"))
      return { display: "ტექნოლ.", className: "department-tech" };
    if (name.includes("მედი"))
      return { display: "მედია", className: "department-media" };

    return {
      display: name.replace("დეპარტამენტი", "").trim(),
      className: "department-other",
    };
  };

  const getPriorityDisplay = (priority) => {
    if (!priority?.name) return "";

    const name = priority.name;
    if (name.includes("Low") || name.includes("დაბალი")) return "დაბალი";
    if (name.includes("Medium") || name.includes("საშუალო")) return "საშუალო";
    if (name.includes("High") || name.includes("მაღალი")) return "მაღალი";
    return name;
  };

  // priority icon
  const getPriorityIcon = (priority) => {
    if (!priority?.name) return null;

    const name = priority.name.toLowerCase();
    if (name.includes("მაღალი") || name.includes("high")) {
      return (
        <img src={highIcon.src} alt="High Priority" className="priority-icon" />
      );
    }
    if (name.includes("საშუალო") || name.includes("medium")) {
      return (
        <img
          src={mediumIcon.src}
          alt="Medium Priority"
          className="priority-icon"
        />
      );
    }
    if (name.includes("დაბალი") || name.includes("low")) {
      return (
        <img src={lowIcon.src} alt="Low Priority" className="priority-icon" />
      );
    }
    return null;
  };

  return (
    <Link href={`/tasks/${task.id}`} className="task-card-link">
      <div className={`task-card ${getTaskStatusClass(task.status)}`}>
        <div className="task-card-header">
          <div className="task-meta">
            {task.priority && (
              <span
                className={`priority-badge ${getPriorityClass(task.priority)}`}
              >
                {getPriorityIcon(task.priority)}
                {getPriorityDisplay(task.priority)}
              </span>
            )}
            {task.department && (
              <span
                className={`department-badge ${
                  getDepartmentInfo(task.department).className
                }`}
              >
                {getDepartmentInfo(task.department).display}
              </span>
            )}
          </div>
          {task.due_date && (
            <span className="due-date">{formatDate(task.due_date)}</span>
          )}
        </div>

        <div className="task-card-content">
          <h3 className="task-title">{task.name}</h3>
          <p className="task-description">{truncateText(task.description)}</p>
        </div>

        <div className="task-card-footer">
          {task.employee && (
            <div className="employee-avatar">
              {task.employee.avatar ? (
                <img
                  src={task.employee.avatar}
                  alt={`${task.employee.name} ${task.employee.surname || ""}`}
                />
              ) : (
                <span>
                  {task.employee.name ? task.employee.name.charAt(0) : "?"}
                </span>
              )}
            </div>
          )}
          <div className="comment-count">
            <Image width={20} height={20} src={commentIcon} alt="Comment Icon" />
            <span>{task.total_comments || "0"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TaskCard;
