"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  fetchTask,
  fetchStatuses,
  updateTask,
  fetchTaskComments,
  createTaskComment,
} from "@/services/api";
import { formatDate } from "@/lib/utils";
import CommentSection from "@/components/tasks/CommentSection";
import "./page.css";
import highIcon from "../../../../public/images/high.svg";
import mediumIcon from "../../../../public/images/medium.svg";
import lowIcon from "../../../../public/images/low.svg";
import statusIcon from "../../../../public/images/status.svg";
import userIcon from "../../../../public/images/user.svg";
import calendarIcon from "../../../../public/images/calendar.svg";

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id;

  // State
  const [task, setTask] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Load task and statuses
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [taskData, statusesData, commentsData] = await Promise.all([
          fetchTask(taskId),
          fetchStatuses(),
          fetchTaskComments(taskId),
        ]);

        setTask(taskData);
        setStatuses(statusesData);
        setComments(commentsData || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load task data:", err);
        setError("მონაცემების ჩატვირთვა ვერ მოხერხდა");
        setLoading(false);
      }
    };

    if (taskId) {
      loadData();
    }
  }, [taskId]);

  // helper functions to your task detail page component
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

  const getPriorityDisplay = (priority) => {
    if (!priority?.name) return "";

    const name = priority.name;
    if (name.includes("Low") || name.includes("დაბალი")) return "დაბალი";
    if (name.includes("Medium") || name.includes("საშუალო")) return "საშუალო";
    if (name.includes("High") || name.includes("მაღალი")) return "მაღალი";
    return name;
  };

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
    if (name.includes("დიზაინ"))
      return { display: "დიზაინი", className: "department-design" };

    return {
      display: name.replace("დეპარტამენტი", "").trim(),
      className: "department-other",
    };
  };

  // Status change 
  const handleStatusChange = async (e) => {
    const newStatusId = e.target.value;

    try {
      setStatusUpdateLoading(true);
      const updatedTask = await updateTask(taskId, { status_id: newStatusId });
      setTask(updatedTask);
    } catch (err) {
      console.error("Failed to update task status:", err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // priority icons
  const getPriorityIcon = (priority) => {
    if (!priority?.name) return null;

    const name = priority.name.toLowerCase();
    if (name.includes("მაღალი") || name.includes("high")) {
      return highIcon.src;
    }
    if (name.includes("საშუალო") || name.includes("medium")) {
      return mediumIcon.src;
    }
    if (name.includes("დაბალი") || name.includes("low")) {
      return lowIcon.src;
    }
    return null;
  };

  // comment submission
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const newComment = await createTaskComment(taskId, {
        text: commentText,
        parent_id: null,
      });

      setComments((prevComments) => [
        {
          ...newComment,
          sub_comments: [],
          author_nickname: "ემილია მორგანი", // placeholder
          author_avatar: "https://api.dicebear.com/9.x/thumbs/svg?seed=you", // placeholder
        },
        ...prevComments,
      ]);
      setCommentText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // comment reply
  const handleReplySubmit = async (parentId, replyText) => {
    if (!replyText.trim()) return;

    try {
      const newReply = await createTaskComment(taskId, {
        text: replyText,
        parent_id: parentId,
      });

      // update the comments list with the new reply
      setComments((prevComments) => {
        return prevComments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              sub_comments: [
                ...(comment.sub_comments || []),
                {
                  ...newReply,
                  author_nickname: "ნატალია გიორგაძე", // Placeholder
                  author_avatar:
                    "https://api.dicebear.com/9.x/thumbs/svg?seed=you", // Placeholder
                },
              ],
            };
          }
          return comment;
        });
      });
    } catch (err) {
      console.error("Failed to post reply:", err);
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

  if (!task) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <p>დავალება ვერ მოიძებნა</p>
        <button className="retry-button" onClick={() => window.history.back()}>
          უკან დაბრუნება
        </button>
      </div>
    );
  }

  return (
    <div className="task-detail-layout">
      {/* left side - task details */}
      <div className="task-detail-content">
        <div className="task-header">
          <div className="task-inside-meta">
            {task.priority && (
              <div
                className={`priority-inside-badge ${getPriorityClass(
                  task.priority
                )}`}
              >
                {getPriorityIcon(task.priority) && (
                  <img
                    src={getPriorityIcon(task.priority)}
                    alt={task.priority.name}
                    className="priority-inside-icon"
                  />
                )}
                <span className="priority-name">
                  {getPriorityDisplay(task.priority)}
                </span>
              </div>
            )}
            {task.department && (
              <div
                className={`department-inside-badge ${
                  getDepartmentInfo(task.department).className
                }`}
              >
                {getDepartmentInfo(task.department).display}
              </div>
            )}
          </div>

          <h1 className="task-inside-title">{task.name}</h1>

          <div className="task-inside-description">
            <p>{task.description}</p>
          </div>
        </div>

        <div className="task-info-section">
          <h2>დავალების დეტალები</h2>

          <div className="task-info-list">
            <div className="info-row">
              <div className="info-label">
                <Image
                  src={statusIcon}
                  width={20}
                  height={20}
                  alt="status icon"
                />
                სტატუსი
              </div>
              <div className="info-value status-selector">
                <select
                  value={task.status?.id}
                  onChange={handleStatusChange}
                  disabled={statusUpdateLoading}
                  className="status-select"
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="info-row">
              <div className="info-label">
                {" "}
                <Image
                  src={userIcon}
                  width={20}
                  height={20}
                  alt="user icon"
                />{" "}
                თანამშრომელი
              </div>
              <div className="info-value employee-info">
                {task.employee && (
                  <>
                    <div className="employee-avatar">
                      {task.employee.avatar ? (
                        <img
                          src={task.employee.avatar}
                          alt={`${task.employee.name} ${
                            task.employee.surname || ""
                          }`}
                        />
                      ) : (
                        <span className="avatar-placeholder">
                          {task.employee.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="employee-details">
                      {task.department && (
                        <div className="employee-department">
                          {task.department.name}
                        </div>
                      )}
                      <div className="employee-name">
                        {task.employee.name} {task.employee.surname}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="info-row">
              <div className="info-label">
                {" "}
                <Image
                  src={statusIcon}
                  width={20}
                  height={20}
                  alt="calendar icon"
                />{" "}
                დავალების ვადა
              </div>
              <div className="info-value due-inside-date">
                {formatDate(task.due_date)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* right side - comments section */}
      <div className="task-comments-container">
        <CommentSection
          comments={comments}
          commentText={commentText}
          setCommentText={setCommentText}
          submittingComment={submittingComment}
          handleCommentSubmit={handleCommentSubmit}
          handleReplySubmit={handleReplySubmit}
        />
      </div>
    </div>
  );
}
