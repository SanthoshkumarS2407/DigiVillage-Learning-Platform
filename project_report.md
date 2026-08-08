# College Project Report
**Project Title:** Digital Learning Platform for Rural Schools  
**Subject:** CS-302 Full-Stack Web Engineering Mini Project  
**Tech Stack:** React, Vite, Tailwind CSS, Spring Boot 3, Hibernate JPA, MySQL 8.x

---

## 1. Problem Statement

Secondary education in rural and remote communities faces severe structural limitations:
1. **Severe Text Resource Scarcity**: Village schools frequently operate with outdated textbooks and lack laboratory instruments or visual reference cards.
2. **High Teacher Vacancies**: Certified teachers are concentrated in urban areas, leading to massive deficits in STEM curriculum instruction in remote schools.
3. **Inefficient Performance Tracking**: Paper evaluations are difficult to consolidate over time, preventing parents, instructors, or regional administrators from identifying learning gaps.
4. **Poor Bandwidth Limits**: Standard modern heavy educational platforms are designed for high-speed broadband and fail to load on basic village networks.

This project addresses these issues by introducing **Rural Shiksha (Digital Learning Platform for Rural Schools)**, an offline-ready, light, responsive full-stack platform optimized for community tablets and smartphones.

---

## 2. Platform Objectives

- **Democratize STEM Education**: Make certified, high-quality math, science, and computer literacy syllabus chapters accessible for free.
- **Support Asynchronous Study**: Allow kids to watch pre-recorded lectures on shared community mobile phones and download simple PDF notes.
- **Empower Public Teachers**: Let certified educators create customized courses, build chapter-wise questions, and monitor progress without paper overheads.
- **Provide Actionable Insights**: Give regional school administrators full directories of students and teachers, notice board controls, and performance metrics.

---

## 3. User Modules & Features

### A. Admin Module
- **Role-Based Login**: Access to a master control panel.
- **Interactive Overview**: Displays metrics counts for Students, Teachers, Courses, and Scores.
- **Manage Student Directory**: Review, filter, or revoke students' platform access.
- **Manage Faculty Accounts**: Approve, register, or delete teacher accounts.
- **Syllabus Auditing**: Browse and audit all uploaded course packages.
- **Broadcast Notices**: Add/delete regional alerts on the notice board.

### B. Teacher Module
- **Dashboard Metrics**: Analyze "My Courses", "Student Count", and "Quiz Submissions".
- **Course Builder**: Perform CRUD on educational courses.
- **Chapter Syllabus Creator**: Append video links and PDF resources to courses.
- **MCQ Test Builder**: Formulate interactive quizzes with multiple choice options and answer keys.
- **Student Progress Tracker**: Review names, quiz scores, and percentages of students.

### C. Student Module
- **Registration**: Register by inputting School name, Village name, and Class level.
- **Browse Catalog**: Search and filter subjects by Mathematics, Science, or Digital Literacy categories.
- **1-Click Enrollment**: Enroll in active courses.
- **Video Learning Center**: Play lectures, select chapters from syllabus playlists, and download study notes.
- **Attempt MCQ Quizzes**: Take quizzes with interactive selection cards and a 120-second countdown timer.
- **Personal Score History**: Read passing grades and detailed performance logs on the dashboard.

---

## 4. Entity Relationship (ER) Diagram

Below is the structured, relational data design matching our MySQL/Hibernate configurations:

```
[Users] (PK: id)
   |
   |-- 1 : 1 ----> [Students] (PK: studentId, FK: userId)
   |                  |
   |                  |-- 1 : N ----> [Enrollments] (PK: enrollmentId, FK: studentId, courseId)
   |                  |                  |
   |                  |                  +-- N : 1 ----> [Courses]
   |                  |
   |                  +-- 1 : N ----> [Results] (PK: resultId, FK: studentId, quizId)
   |
   +-- 1 : 1 ----> [Teachers] (PK: teacherId, FK: userId)
                      |
                      +-- 1 : N ----> [Courses] (PK: courseId, FK: teacherId)
                                         |
                                         |-- 1 : N ----> [Lessons] (PK: lessonId, FK: courseId)
                                         |
                                         +-- 1 : N ----> [Quiz] (PK: quizId, FK: courseId)
                                                            |
                                                            +-- 1 : N ----> [Questions] (PK: questionId, FK: quizId)
                                                            |
                                                            +-- 1 : N ----> [Results]
```

---

## 5. MySQL Database Tables

### `users`
- `id` (INT, PK, AUTO_INC)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR)
- `role` (ENUM: 'ADMIN', 'TEACHER', 'STUDENT')

### `students`
- `studentId` (INT, PK, AUTO_INC)
- `userId` (INT, FK -> users)
- `school` (VARCHAR)
- `class` (VARCHAR)
- `village` (VARCHAR)

### `teachers`
- `teacherId` (INT, PK, AUTO_INC)
- `userId` (INT, FK -> users)
- `qualification` (VARCHAR)
- `experience` (VARCHAR)

### `courses`
- `courseId` (INT, PK, AUTO_INC)
- `teacherId` (INT, FK -> teachers)
- `title` (VARCHAR)
- `description` (TEXT)
- `category` (VARCHAR)
- `thumbnail` (VARCHAR)

---

## 6. PowerPoint (PPT) Presentation Slides Content

Use this professional layout slide-by-slide for your final project evaluation/viva:

### Slide 1: Project Title & Introduction
- **Title**: Digital Learning Platform for Rural Schools
- **Subtitle**: Bridging the Educational Divide with Full-Stack Web Technologies
- **Presented By**: [Your Name/Group Members]
- **Academic Year**: 2026

### Slide 2: Problem Statement
- Lack of textbook access and physical learning media in remote secondary schools.
- High STEM instructor vacancies in rural villages.
- Inability to measure or log student performance metrics on paper.
- Incompatible heavy platforms on slow rural networks.

### Slide 3: Proposed Solution
- A lightweight, responsive web application (**Rural Shiksha**).
- Standard pre-loaded syllabus chapters, video plays, and small PDF notes.
- Simple interactive MCQ tests with timers for automatic evaluation.
- Secure, role-based login panels.

### Slide 4: System Architecture (React + Spring Boot)
- **Client Tier**: Single Page React App styled with Tailwind CSS, using Recharts for analytics and Lucide for vector icons.
- **Backend Service Tier**: Spring Boot 3 handling Spring Security and JWT role-based authorizations.
- **Persistence Tier**: JPA/Hibernate ORM connected to a relational MySQL server database.

### Slide 5: Database Schema Design (MySQL)
- Relational tables with proper Primary and Foreign Key constraints.
- Optimized mapping: Users, Students, Teachers, Courses, Lessons, Quizzes, and Results.
- Structured seed data to accelerate initial classroom setup.

### Slide 6: Key Functional Modules Demo
- **Multi-Role Dashboards**: Specific metric summary widgets and actions for Admins, Teachers, and Students.
- **Syllabus Playlists**: Embedded responsive player and notes download managers.
- **Active Quiz Evaluator**: Dynamic timer limits and instant pass/fail report grading.

### Slide 7: Technical Highlights & Best Practices
- **RESTful Architecture**: Clean HTTP mapping (`GET`, `POST`, `PUT`, `DELETE`).
- **Authorization Guard**: Custom token checks to shield instructor editing routes.
- **Clean Folder Structure**: Standard MVC packages for Java files, and modular component assets on the frontend.

### Slide 8: Future Enhancements & Scope
- Integrate speech-to-text translators for local regional dialects.
- Enable offline service worker synchronization to complete quizzes offline.
- Connect parent notification SMS gateways.

### Slide 9: Conclusion & Q&A
- Summarize platform milestones and village benefits.
- Thank the examining board.
- Open floor for technical questions.
