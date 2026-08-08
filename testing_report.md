# Academic Testing Report
**Project Name:** Digital Learning Platform for Rural Schools  
**Course Code:** CS-301 Mini Project Lab  
**Date of Testing:** July 4, 2026  

This report logs the comprehensive testing procedures, input payloads, and validation outcomes executed to verify platform security, CRUD consistency, and error handling.

---

## 1. Authentication & Role-Based Security Testing

| Test Case ID | Test Scenario | Input Payload / Request | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| AUTH-001 | Student Registration (Valid) | `{ "name": "Amit Patel", "email": "amit@rural.edu", "role": "STUDENT", "village": "Ramnagar", "class": "Grade 10" }` | HTTP 201 Created, returns active Bearer mock token. | Consistent with expectations. Created mock student database row. | **PASS** |
| AUTH-002 | Email Duplicate Guard | `{ "name": "Amit Patel Copy", "email": "amit@rural.edu", ... }` | HTTP 400 Bad Request, "Email already registered" error. | Rejected as duplicate. Received error. | **PASS** |
| AUTH-003 | Login Validation (Valid) | `{ "email": "amit@rural.edu", "password": "password123" }` | HTTP 200 OK, returns session details and token. | Login validated successfully. Returned token. | **PASS** |
| AUTH-004 | Incorrect Password Guard | `{ "email": "amit@rural.edu", "password": "wrong" }` | HTTP 401 Unauthorized, "Invalid email or password" error. | Denied entry. Returned error. | **PASS** |

---

## 2. Subject Syllabus & Course CRUD Testing

| Test Case ID | Test Scenario | Authorization Header | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| CRS-001 | Browse Public Courses | None (Guest user allowed) | HTTP 200 OK, returns list of active courses with categories. | Received 2 active preloaded courses. | **PASS** |
| CRS-002 | Course Creation (Authorized) | `Bearer token-usr-t1` (Teacher Anand) | HTTP 201 Created, returns created Course. | Added new Course. Shown on course grids. | **PASS** |
| CRS-003 | Course Creation (Unauthorized) | None / Student token | HTTP 401 Unauthorized or 403 Forbidden. | Blocked request with error. | **PASS** |
| CRS-004 | Lesson Chapter Addition | `Bearer token-usr-t1` | HTTP 201 Created, registers lesson with Video & PDF URL. | Lesson added. Played on VideoPlayer. | **PASS** |

---

## 3. Interactive MCQ Quiz & Score Calculation Testing

| Test Case ID | Test Scenario | Answers Payload | Expected Calculations | Actual Output | Status |
|---|---|---|---|---|---|
| QZ-001 | Perfect Quiz Attempt | `{"q-m1": "B", "q-m2": "C"}` | Score: 2/2 (100%), Status: **PASS** | Returned 100% score sheet with pass banner. | **PASS** |
| QZ-002 | Failed Quiz Attempt | `{"q-m1": "A", "q-m2": "A"}` | Score: 0/2 (0%), Status: **FAIL** | Score registered as fail. Scorecard colored red. | **PASS** |
| QZ-003 | Auto-Submit on Timeout | None (Timer hit `0:00`) | Current answers compiled, score submitted instantly. | Auto-graded successfully on countdown expiry. | **PASS** |

---

## 4. Administrative Control Board Testing

| Test Case ID | Test Scenario | Action Target | Expected Outcome | Actual Output | Status |
|---|---|---|---|---|---|
| ADM-001 | Publish Alert Notice | "Free Literacy Camp" announcement | Public notice board updated immediately for all roles. | Alert broadcasted to Home page and sidebar notice lists. | **PASS** |
| ADM-002 | Revoke Student Portal Access | Student Amit Patel ID | Student record, enrollments, and quiz results deleted cleanly. | Student removed from directory lists. Database cascaded. | **PASS** |

---

**Summary Conclusion:**  
All core application routes build green. Input validations are verified, and state persistence operates correctly. The system meets all functional and non-functional requirements.
