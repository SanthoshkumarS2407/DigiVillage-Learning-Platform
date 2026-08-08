-- =====================================================================
-- DIGITAL LEARNING PLATFORM FOR RURAL SCHOOLS - DATABASE SCHEMA
-- Target DBMS: MySQL 8.x / MariaDB
-- College Mini Project Database Deliverables
-- =====================================================================

CREATE DATABASE IF NOT EXISTS rural_learning_db;
USE rural_learning_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. STUDENTS DETAIL TABLE
CREATE TABLE IF NOT EXISTS students (
    studentId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    school VARCHAR(150) NOT NULL,
    class VARCHAR(50) NOT NULL,
    village VARCHAR(100) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TEACHERS DETAIL TABLE
CREATE TABLE IF NOT EXISTS teachers (
    teacherId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    qualification VARCHAR(150) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    courseId INT AUTO_INCREMENT PRIMARY KEY,
    teacherId INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    thumbnail VARCHAR(255),
    FOREIGN KEY (teacherId) REFERENCES teachers(teacherId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. LESSONS TABLE
CREATE TABLE IF NOT EXISTS lessons (
    lessonId INT AUTO_INCREMENT PRIMARY KEY,
    courseId INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    videoUrl VARCHAR(255) NOT NULL,
    pdfUrl VARCHAR(255),
    FOREIGN KEY (courseId) REFERENCES courses(courseId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. QUIZ TABLE
CREATE TABLE IF NOT EXISTS quiz (
    quizId INT AUTO_INCREMENT PRIMARY KEY,
    courseId INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    FOREIGN KEY (courseId) REFERENCES courses(courseId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    questionId INT AUTO_INCREMENT PRIMARY KEY,
    quizId INT NOT NULL,
    question TEXT NOT NULL,
    optionA VARCHAR(255) NOT NULL,
    optionB VARCHAR(255) NOT NULL,
    optionC VARCHAR(255) NOT NULL,
    optionD VARCHAR(255) NOT NULL,
    answer ENUM('A', 'B', 'C', 'D') NOT NULL,
    FOREIGN KEY (quizId) REFERENCES quiz(quizId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. RESULTS TABLE
CREATE TABLE IF NOT EXISTS results (
    resultId INT AUTO_INCREMENT PRIMARY KEY,
    studentId INT NOT NULL,
    quizId INT NOT NULL,
    score INT NOT NULL,
    totalQuestions INT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    pass BOOLEAN NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students(studentId) ON DELETE CASCADE,
    FOREIGN KEY (quizId) REFERENCES quiz(quizId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
    announcementId INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. ENROLLMENTS RELATION TABLE (Student to Course mapping)
CREATE TABLE IF NOT EXISTS enrollments (
    enrollmentId INT AUTO_INCREMENT PRIMARY KEY,
    studentId INT NOT NULL,
    courseId INT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES students(studentId) ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES courses(courseId) ON DELETE CASCADE,
    UNIQUE KEY unique_student_course (studentId, courseId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =====================================================================
-- POPULATE SEED SAMPLE DATA
-- =====================================================================

-- Seed Users
INSERT INTO users (id, name, email, password, role) VALUES 
(1, 'Admin Root', 'admin@rural.edu', 'password123', 'ADMIN'),
(2, 'Dr. Anand Kumar', 'anand@rural.edu', 'password123', 'TEACHER'),
(3, 'Savita Devi', 'savita@rural.edu', 'password123', 'TEACHER'),
(4, 'Amit Patel', 'amit@rural.edu', 'password123', 'STUDENT'),
(5, 'Priya Sharma', 'priya@rural.edu', 'password123', 'STUDENT');

-- Seed Students
INSERT INTO students (studentId, userId, school, class, village) VALUES 
(1, 4, 'Govt Boys High School', 'Grade 10', 'Ramnagar'),
(2, 5, 'Govt Girls Senior Secondary', 'Grade 12', 'Shyamgarh');

-- Seed Teachers
INSERT INTO teachers (teacherId, userId, qualification, experience) VALUES 
(1, 2, 'Ph.D. in Mathematics, B.Ed', '12 Years'),
(2, 3, 'M.Sc. in Physics, M.Ed', '8 Years');

-- Seed Courses
INSERT INTO courses (courseId, teacherId, title, description, category, thumbnail) VALUES 
(1, 1, 'Foundational Algebra & Geometry', 'An easy-to-understand foundational math course covering coordinate geometry, algebraic expressions, and linear equations with visual representations.', 'Mathematics', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=60'),
(2, 2, 'Introduction to Physics: Light & Heat', 'Explore the basics of optics, reflection, refraction, lenses, and thermal properties with simple rural experiments and household setups.', 'Science', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=60'),
(3, 2, 'High School Tamil Literature & Grammar', 'An engaging course on standard Tamil literature, beautiful classical poems (Sangam literature), and fundamental grammar rules (Yal and Ani) designed for high school pupils.', 'Tamil', 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=600&auto=format&fit=crop&q=60'),
(4, 2, 'Spoken English & Functional Grammar', 'Master active conversation, tense conjugations, everyday vocabulary, and paragraph writing. Tailored for rural students to confidently speak and write in English.', 'English', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=60'),
(5, 1, 'Introduction to Social Science: Civics & Geography', 'Understand our democratic constitution, local governance systems (Panchayati Raj), and regional landforms with easy-to-follow maps and community examples.', 'Social Science', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60');

-- Seed Lessons
INSERT INTO lessons (lessonId, courseId, title, videoUrl, pdfUrl) VALUES 
(1, 1, 'Chapter 1: Understanding Coordinates', 'https://www.youtube.com/watch?v=8b06BCO7_B0', '#'),
(2, 1, 'Chapter 2: Linear Equations Visualized', 'https://www.youtube.com/watch?v=F380l-A9hB0', '#'),
(3, 2, 'Chapter 1: Reflection of Light & Mirror Equations', 'https://www.youtube.com/watch?v=gda3791a8N8', '#'),
(4, 2, 'Chapter 2: Lenses & Human Eye Vision', 'https://www.youtube.com/watch?v=cI7f7K4z1P0', '#'),
(5, 3, 'Chapter 1: Thirukkural - Wisdom & Values (திருக்குறள் அறநெறிகள்)', 'https://www.youtube.com/watch?v=pS3tM1gH-6c', '#'),
(6, 3, 'Chapter 2: Tamil Grammar Basics (எழுத்து இலக்கணம்)', 'https://www.youtube.com/watch?v=Yp69z7-bAt8', '#'),
(7, 4, 'Chapter 1: Functional Greetings & Spoken Expressions', 'https://www.youtube.com/watch?v=p79pEIDz0-s', '#'),
(8, 4, 'Chapter 2: Tenses & Sentence Structuring', 'https://www.youtube.com/watch?v=73UOfp8Yp6Q', '#'),
(9, 5, 'Chapter 1: Fundamental Rights & Duties of Citizens', 'https://www.youtube.com/watch?v=8_nLpD_0b3c', '#'),
(10, 5, 'Chapter 2: Earth Landforms and Hydrological Cycle', 'https://www.youtube.com/watch?v=zNdbjCg-568', '#');

-- Seed Quizzes
INSERT INTO quiz (quizId, courseId, title) VALUES 
(1, 1, 'Algebra & Geometry Quick Check'),
(2, 2, 'Optics & Physics Basics Quiz'),
(3, 3, 'Tamil Literature & Grammar Quiz'),
(4, 4, 'Functional English Grammar Evaluation'),
(5, 5, 'Civics & Constitution Assessment');

-- Seed Questions
INSERT INTO questions (questionId, quizId, question, optionA, optionB, optionC, optionD, answer) VALUES 
(1, 1, 'What is the value of x if 2x + 7 = 15?', 'x = 3', 'x = 4', 'x = 8', 'x = 5', 'B'),
(2, 1, 'What point coordinates represent the origin?', '(1, 1)', '(0, 1)', '(0, 0)', '(-1, -1)', 'C'),
(3, 2, 'Which of the following mirrors is used in vehicle headlights?', 'Convex mirror', 'Concave mirror', 'Plane mirror', 'Bifocal mirror', 'B'),
(4, 2, 'Light travels in which type of path?', 'Curved path', 'Circular path', 'Straight-line path', 'Zig-zag path', 'C'),
(5, 3, 'Who is the legendary author of Thirukkural (திருக்குறள்)?', 'Kambar', 'Thiruvalluvar', 'Ilango Adigal', 'Avvaiyar', 'B'),
(6, 3, 'How many chapters (Adhikaram) are there in the Thirukkural?', '100', '120', '133', '150', 'C'),
(7, 4, 'Which verb form correctly completes: ''She ____ to school every day''?', 'go', 'goes', 'going', 'gone', 'B'),
(8, 4, 'What is the antonym of the word ''Ancient''?', 'Old', 'Modern', 'Historic', 'Prehistoric', 'B'),
(9, 5, 'Who is known as the Father of the Indian Constitution?', 'Mahatma Gandhi', 'Dr. B.R. Ambedkar', 'Jawaharlal Nehru', 'Dr. Rajendra Prasad', 'B'),
(10, 5, 'What level of local self-government operates at the village level in India?', 'Zilla Parishad', 'Panchayat Samiti', 'Gram Panchayat', 'Municipal Corporation', 'C');

-- Seed Results
INSERT INTO results (resultId, studentId, quizId, score, totalQuestions, percentage, pass, date) VALUES 
(1, 1, 1, 2, 2, 100.00, 1, '2026-07-02 10:00:00');

-- Seed Announcements
INSERT INTO announcements (announcementId, title, description, date) VALUES 
(1, 'Free Digital Literacy Camp next week', 'We are organizing a 3-day digital literacy workshop from July 10th to 12th. Learn basic computer skills, Google Search, and internet safety in our Ramnagar school laboratory.', '2026-07-04 07:15:00'),
(2, 'Weekly Science Quiz starts this Saturday', 'Compete in our weekly state science quiz challenge! Cash rewards and digital achievement certificates for top 3 students.', '2026-07-03 11:30:00');

-- Seed Enrollments
INSERT INTO enrollments (enrollmentId, studentId, courseId, date) VALUES 
(1, 1, 1, '2026-07-01 08:00:00');
