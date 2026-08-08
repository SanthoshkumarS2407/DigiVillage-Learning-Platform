# Digital Learning Platform for Rural Schools (Rural Shiksha)

A professional, full-stack digital learning platform designed to bridge the educational resource gap in rural schools. Built with React, Vite, Tailwind CSS, and Node.js/Express (with compile-ready Spring Boot + MySQL configurations prepared for academic submission).

---

## 🎨 Creative & UI Design Theme
This platform is styled with a highly polished, desktop-first responsive layout focusing on clarity, speed, and contrast:
- **Clean Slate Interface**: High contrast off-whites and dark slate grays reduce visual strain and look crisp on school tablets.
- **Micro-Animations**: Uses `motion` for smooth drawer toggles, model slides, and active MCQ card selections.
- **Data Visualizations**: Implements Recharts dashboard widgets summarizing registrations, academic scores, and average class performance.

---

## ⚡ Key Features

### 👨‍🎓 For Students
- **Explore Subjects**: Search and filter public school curricula by Mathematics, Science, and Digital Literacy.
- **Syllabus Center**: Watch lesson videos, navigate chapter playlists, and download offline revision summaries.
- **Interactive Quizzes**: Complete MCQs under a 120-second active countdown timer.
- **Score Analytics**: Review detailed grade cards, score averages, and pass/fail states in real-time.

### 👩‍🏫 For Teachers
- **Course Builder**: Create, update, or delete courses.
- **Chapter Syllabus Managers**: Link teaching videos and lesson materials.
- **Evaluation Creator**: Add mock evaluation questions and answers.
- **Performance Grader**: Track class completion percentages, test scores, and student profiles.

### 👑 For Administrators
- **Administrative Control Board**: View metric counts for active teachers, students, and courses.
- **Account Control**: Audit, add, or revoke student and teacher logins.
- **Regional Broadcasting**: Manage school notice boards to issue alerts about digital literacy camps or test schedules.

---

## 🛠️ Technology Stack
- **Frontend Core**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Interactive Graphs**: Recharts
- **Development Server API**: Node.js, Express, JSON database persistence (for instant local preview)
- **Production Backend Blueprint**: Spring Boot 3, Hibernate JPA, Java 21, MySQL 8.0 (Files included in `/backend` package)

---

## 🚀 Getting Started

### 1. Run the Development Server (Vite + Express Proxy)
The workspace runs both the React frontend and local database proxy concurrently on port `3000`.

To install dependencies and start the preview server:
```bash
# Install NPM modules
npm install

# Build the development server
npm run dev
```

Open the local iframe or browser tab on `http://localhost:3000` to preview the application!

### 2. Live Demo Credentials
Quickly inspect different dashboard modules using our pre-configured credentials on the login screen:
- **Admin Panel Access**: `admin@rural.edu` (password: `password123`)
- **Teacher Panel Access**: `anand@rural.edu` (password: `password123`)
- **Student Panel Access**: `amit@rural.edu` (password: `password123`)

---

## 📂 Project Directory Structure

```
├── /backend                    # Production Spring Boot Java Blueprint
│   ├── pom.xml                 # Maven Configurations (Spring Security, JPA, MySQL)
│   ├── /resources
│   │   └── application.properties # SQL connection properties and JWT key secrets
│   └── /src/main/java          # Spring Boot Application entrypoint & controllers
├── /src                        # React Frontend Core
│   ├── /components             # Reusable UI elements (Navbar, Sidebar, VideoPlayer, Footer)
│   ├── /context                # Global state wrappers (AuthContext session management)
│   ├── /pages                  # Application Views (Home, Login, Register, Dashboard, Courses)
│   ├── /services               # Axios clients with JWT automatic interceptors
│   ├── App.tsx                 # Core Route definitions & Protected Route locks
│   ├── main.tsx                # Client initialization
│   └── index.css               # Tailwind setup and Space Grotesk fonts
├── schema.sql                  # Complete MySQL table schemas & initial seed records
├── postman_collection.json     # Ready-to-import Postman API collection
├── testing_report.md           # Formal college mini-project testing logs
└── project_report.md           # Academic project blueprint with presentation slides outline
```

---

## 📖 Evaluation Deliverables Included
For college project submissions, we have fully generated:
1. **`/schema.sql`**: Complete database script including custom seed values for instant MySQL Workbench loading.
2. **`/postman_collection.json`**: API request payloads and variables.
3. **`/testing_report.md`**: Evaluation status checks for your laboratory records.
4. **`/project_report.md`**: Complete conceptual documentation including PowerPoint (PPT) presentation slide outlines to guarantee a flawless viva presentation!
