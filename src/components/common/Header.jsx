"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./Header.css";
import EmployeeModal from "../employees/EmployeeModal";
import Logo from "../../../public/images/logo.svg";
import pluseIcon from "../../..//public/images/pluseIcon.svg";

const Header = () => {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  const openEmployeeModal = () => {
    setIsEmployeeModalOpen(true);
  };

  const closeEmployeeModal = () => {
    setIsEmployeeModalOpen(false);
  };

  const handleEmployeeCreated = (newEmployee) => {
    console.log("New employee created dasatestad:", newEmployee);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo-link">
          <Image width={214} height={38} alt="Logo" src={Logo}></Image>
        </Link>

        <div className="header-actions">
          <button className="employee-button" onClick={openEmployeeModal}>
            თანამშრომლის შექმნა
          </button>

          <Link href="/tasks/new" className="header-button task-button">
            <Image
              className="pluse-icon"
              src={pluseIcon}
              width={20}
              height={20}
              alt="Pluse Icon"
            />{" "}
            შექმენი ახალი დავალება
          </Link>
        </div>
      </div>

      {isEmployeeModalOpen && (
        <EmployeeModal
          isOpen={isEmployeeModalOpen}
          onClose={closeEmployeeModal}
          onEmployeeCreated={handleEmployeeCreated}
        />
      )}
    </header>
  );
};

export default Header;
