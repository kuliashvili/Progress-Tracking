"use client";

import React, { useState, useEffect } from "react";
import { fetchDepartments, createEmployee } from "@/services/api";
import Image from "next/image";
import "./EmployeeModal.css";
import closeIcon from "../../../public/images/closeicon.svg";
import trashIcon from "../../../public/images/trash.svg";
import uploadIcon from "../../../public/images/upload.svg";

const EmployeeModal = ({ isOpen, onClose, onEmployeeCreated }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    avatar: null,
    department_id: "",
  });

  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const deptData = await fetchDepartments();
        setDepartments(deptData);
      } catch (error) {
        console.error("Error loading departments", error);
      }
    };

    loadDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setTouched((prev) => ({ ...prev, [name]: true }));

    validateField(name, value);
  };

  // file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 600 * 1024) {
        // 600KB
        setErrors((prev) => ({
          ...prev,
          avatar: "ფაილის ზომა უნდა იყოს მაქსიმუმ 600KB",
        }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          avatar: "ფაილი უნდა იყოს სურათი",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: file }));
      setErrors((prev) => ({ ...prev, avatar: null }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: null }));
    setPreviewUrl(null);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "first_name":
      case "last_name":
        if (!value) error = "ველის შევსება აუცილებელია";
        else if (value.length < 2) error = "მინიმუმ 2 სიმბოლო";
        else if (value.length > 255) error = "მაქსიმუმ 255 სიმბოლო";
        else {
          // only Georgian and Latin characters allowed
          const regex = /^[a-zA-Zა-ჰ\s]+$/;
          if (!regex.test(value)) {
            error = "მხოლოდ ქართული და ლათინური სიმბოლოები";
          }
        }
        break;

      case "department_id":
        if (!value) error = "დეპარტამენტი აუცილებელია";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    Object.entries({
      first_name: formData.first_name,
      last_name: formData.last_name,
      department_id: formData.department_id,
    }).forEach(([name, value]) => {
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    if (!formData.avatar) {
      newErrors.avatar = "ავატარი აუცილებელია";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      first_name: true,
      last_name: true,
      avatar: true,
      department_id: true,
    });

    if (validateForm()) {
      try {
        setIsSubmitting(true);

        // FormData for file upload
        const data = new FormData();
        data.append("name", formData.first_name);
        data.append("surname", formData.last_name);
        data.append("avatar", formData.avatar);
        data.append("department_id", formData.department_id);

        const newEmployee = await createEmployee(data);

        setFormData({
          first_name: "",
          last_name: "",
          avatar: null,
          department_id: "",
        });
        setPreviewUrl(null);

        onEmployeeCreated(newEmployee);
        onClose();
      } catch (error) {
        console.error("Error creating employee", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <Image src={closeIcon} alt="Close" width={40} height={40} />
        </button>
        <div className="modal-header">
          <h2>თანამშრომლის დამატება</h2>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="namesurname-form-group">
            <div className="form-group namesurname">
              <label htmlFor="first_name">სახელი*</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  errors.first_name && touched.first_name ? "error" : ""
                }
              />
              <div className="validation-indicators">
                <div
                  className={`validation-item ${
                    !touched.first_name
                      ? ""
                      : formData.first_name.length >= 2
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
                  <span>მინიმუმ 2 სიმბოლო</span>
                </div>
                <div
                  className={`validation-item ${
                    !touched.first_name
                      ? ""
                      : formData.first_name.length <= 255 &&
                        formData.first_name.length >= 1
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

            <div className="form-group namesurname">
              <label htmlFor="last_name">გვარი*</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.last_name && touched.last_name ? "error" : ""}
              />
              <div className="validation-indicators">
                <div
                  className={`validation-item ${
                    !touched.last_name
                      ? ""
                      : formData.last_name.length >= 2
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
                  <span>მინიმუმ 2 სიმბოლო</span>
                </div>
                <div
                  className={`validation-item ${
                    !touched.last_name
                      ? ""
                      : formData.last_name.length <= 255 &&
                        formData.last_name.length >= 1
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
          </div>

          <div className="form-group">
            <label>ავატარი*</label>
            <div className="avatar-upload-area">
              {previewUrl ? (
                <div className="avatar-preview-wrapper">
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="avatar-preview"
                  />
                  <button
                    type="button"
                    className="remove-avatar-button"
                    onClick={handleRemoveAvatar}
                  >
                    <Image
                      src={trashIcon}
                      alt="Remove"
                      width={16}
                      height={16}
                    />
                  </button>
                </div>
              ) : (
                <label htmlFor="avatar" className="upload-label-container">
                  <input
                    type="file"
                    id="avatar"
                    name="avatar"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="file-input"
                  />
                  <div className="upload-content">
                    <Image
                      alt="upload icon"
                      className="upload-image-icon"
                      src={uploadIcon}
                      width={24}
                      height={24}
                    />
                    <span className="upload-content-header">ატვირთე ფოტო</span>
                  </div>
                </label>
              )}
            </div>
            {errors.avatar && touched.avatar && (
              <div className="error-message">{errors.avatar}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="department_id">დეპარტამენტი*</label>
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
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              გაუქმება
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "დამუშავება..." : "დაამატე თანამშრომელი"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
