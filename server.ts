import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  User, Student, Teacher, Course, Lesson, Quiz, Question, Result, Announcement, Enrollment, Resource, CourseReview, Assignment, AssignmentSubmission, CourseComment, Bookmark
} from './src/types';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'database.json');

// Interface for DB file structure
interface DatabaseSchema {
  users: User[];
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
  lessons: Lesson[];
  quizzes: Quiz[];
  questions: Question[];
  results: Result[];
  announcements: Announcement[];
  enrollments: Enrollment[];
  resources: Resource[];
  reviews: CourseReview[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  comments?: CourseComment[];
  bookmarks?: Bookmark[];
}

const DEFAULT_RESOURCES: Resource[] = [
  {
    resourceId: 'res-math1',
    courseId: 'crs-math',
    title: 'Algebra Identities & Coordinate Geometry Formulas',
    description: 'A comprehensive formulas and identities quick reference guide for 9th and 10th standard algebraic expansions, coordinate planes, distance, and section equations.',
    type: 'Cheat Sheet',
    fileSize: '1.2 MB',
    downloadUrl: '/api/resources/res-math1/download',
    addedBy: 'Dr. Nakul',
    date: '2026-07-02T09:30:00.000Z'
  },
  {
    resourceId: 'res-math2',
    courseId: 'crs-math',
    title: 'Linear Equations Solved Practice Worksheet',
    description: 'Comprehensive practice worksheet containing 15 high-school linear equation questions, graphical step-by-step solutions, and exam-focused tips.',
    type: 'Practice Paper',
    fileSize: '2.4 MB',
    downloadUrl: '/api/resources/res-math2/download',
    addedBy: 'Dr. Nakul',
    date: '2026-07-03T14:15:00.000Z'
  },
  {
    resourceId: 'res-sci1',
    courseId: 'crs-sci',
    title: 'Ray Diagrams Mastery Guide (Mirrors & Lenses)',
    description: 'Step-by-step visual blueprints and guidelines for drawing image formation paths across convex, concave mirrors, and thin spherical lenses.',
    type: 'Handout',
    fileSize: '3.1 MB',
    downloadUrl: '/api/resources/res-sci1/download',
    addedBy: 'Dr. Meera',
    date: '2026-07-01T10:00:00.000Z'
  },
  {
    resourceId: 'res-sci2',
    courseId: 'crs-sci',
    title: 'DIY Optics & Thermal physics Experiments Guide',
    description: 'Hands-on project handbook demonstrating how to investigate laws of reflection, refraction, and thermal conductivity at home using simple, inexpensive village items.',
    type: 'Reading Guide',
    fileSize: '1.8 MB',
    downloadUrl: '/api/resources/res-sci2/download',
    addedBy: 'Dr. Meera',
    date: '2026-07-04T11:00:00.000Z'
  },
  {
    resourceId: 'res-eng1',
    courseId: 'crs-eng',
    title: '12 English Tenses Comprehensive Study Guide',
    description: 'Full tense layout tables, timeline indicator illustrations, conjugations of active-passive verbs, and daily practice sentences with answers.',
    type: 'Reading Guide',
    fileSize: '2.1 MB',
    downloadUrl: '/api/resources/res-eng1/download',
    addedBy: 'Ms. Ananya Iyer',
    date: '2026-07-01T15:00:00.000Z'
  },
  {
    resourceId: 'res-eng2',
    courseId: 'crs-eng',
    title: 'Everyday Spoken English Greetings & Phrases Booklet',
    description: 'Practical dialogue modules covering bank visits, school interactions, marketplace conversations, and writing standard applications.',
    type: 'Handout',
    fileSize: '1.1 MB',
    downloadUrl: '/api/resources/res-eng2/download',
    addedBy: 'Ms. Ananya Iyer',
    date: '2026-07-04T09:30:00.000Z'
  }
];

// Default Seed Data
const DEFAULT_DB: DatabaseSchema = {
  users: [
    // Admins
    { id: 'usr-admin', name: 'Dr.Arjun Prakash', email: 'arjun.prakash@rural.edu', password: 'password123', role: 'ADMIN' },
    { id: 'usr-admin2', name: 'Mr.Karthick Raman', email: 'karthick.raman@rural.edu', password: 'password123', role: 'ADMIN' },
    { id: 'usr-admin3', name: 'Ms.Priya Narayanan', email: 'priya.narayanan@rural.edu', password: 'password123', role: 'ADMIN' },

    // Teachers
    { id: 'usr-t1', name: 'Ms.Ananya Iyer', email: 'ananya@rural.edu', password: 'password123', role: 'TEACHER' },
    { id: 'usr-t2', name: 'Mr.Vikram', email: 'vikram@rural.edu', password: 'password123', role: 'TEACHER' },
    { id: 'usr-t3', name: 'Dr.Meera', email: 'meera@rural.edu', password: 'password123', role: 'TEACHER' },
    { id: 'usr-t4', name: 'Mr.Ragavan', email: 'ragavan@rural.edu', password: 'password123', role: 'TEACHER' },
    { id: 'usr-t5', name: 'Mr.Adtiya Menon', email: 'adtiya@rural.edu', password: 'password123', role: 'TEACHER' },

    // Professors (role: TEACHER)
    { id: 'usr-p1', name: 'Dr.Nakul', email: 'nakul@rural.edu', password: 'password123', role: 'TEACHER' },
    { id: 'usr-p2', name: 'Dr.palani vel', email: 'palanivel@rural.edu', password: 'password123', role: 'TEACHER' },
    { id: 'usr-p3', name: 'Mr.Keshavan', email: 'keshavan@rural.edu', password: 'password123', role: 'TEACHER' },
    { id: 'usr-p4', name: 'Dr.Gomathi', email: 'gomathi@rural.edu', password: 'password123', role: 'TEACHER' },

    // Students (30 Students)
    { id: 'usr-s1', name: 'Arjun', email: 'arjun@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s2', name: 'Kavin', email: 'kavin@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s3', name: 'Raj', email: 'raj@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s4', name: 'Venkatesh', email: 'venkatesh@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s5', name: 'Harini', email: 'harini@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s6', name: 'Muthu', email: 'muthu@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s7', name: 'Vel', email: 'vel@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s8', name: 'Kavitha Subbu', email: 'kavitha@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s9', name: 'Karthik Raja', email: 'karthik@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s10', name: 'Deepa Lakshmi', email: 'deepa@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s11', name: 'Saravanan M', email: 'saravanan@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s12', name: 'Malathi K', email: 'malathi@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s13', name: 'Vignesh Kumar', email: 'vignesh@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s14', name: 'Priya Dharshini', email: 'priya@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s15', name: 'Manikandan R', email: 'manikandan@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s16', name: 'Anitha S', email: 'anitha@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s17', name: 'Selvam V', email: 'selvam@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s18', name: 'Lakshmi Prabha', email: 'lakshmi@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s19', name: 'Surya Prakash', email: 'surya@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s20', name: 'Divya Bharathi', email: 'divya@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s21', name: 'Ramesh Babu', email: 'ramesh@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s22', name: 'Meenakshi Sundaram', email: 'meenakshi@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s23', name: 'Dinesh K', email: 'dinesh@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s24', name: 'Sowmya N', email: 'sowmya@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s25', name: 'Balamurugan P', email: 'balamurugan@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s26', name: 'Sandhya R', email: 'sandhya@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s27', name: 'Gopi Krishna', email: 'gopi@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s28', name: 'Pavithra S', email: 'pavithra@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s29', name: 'Praveen Raj', email: 'praveen@rural.edu', password: 'password123', role: 'STUDENT' },
    { id: 'usr-s30', name: 'Janani V', email: 'janani@rural.edu', password: 'password123', role: 'STUDENT' }
  ],
  students: [
    { studentId: 'std-1', userId: 'usr-s1', school: 'Govt Boys High School', class: 'Grade 10', village: 'Ramnagar' },
    { studentId: 'std-2', userId: 'usr-s2', school: 'Govt Boys High School', class: 'Grade 10', village: 'Ramnagar' },
    { studentId: 'std-3', userId: 'usr-s3', school: 'Govt Boys High School', class: 'Grade 12', village: 'Ramnagar' },
    { studentId: 'std-4', userId: 'usr-s4', school: 'Govt Boys High School', class: 'Grade 12', village: 'Melur' },
    { studentId: 'std-5', userId: 'usr-s5', school: 'Govt Girls High School', class: 'Grade 10', village: 'Melur' },
    { studentId: 'std-6', userId: 'usr-s6', school: 'Govt High School', class: 'Grade 10', village: 'Melur' },
    { studentId: 'std-7', userId: 'usr-s7', school: 'Govt High School', class: 'Grade 12', village: 'Shyamgarh' },
    { studentId: 'std-8', userId: 'usr-s8', school: 'Govt Girls Higher Sec School', class: 'Grade 11', village: 'Ramnagar' },
    { studentId: 'std-9', userId: 'usr-s9', school: 'Govt Boys Higher Sec School', class: 'Grade 10', village: 'Kaveripatnam' },
    { studentId: 'std-10', userId: 'usr-s10', school: 'Govt High School', class: 'Grade 12', village: 'Papanasam' },
    { studentId: 'std-11', userId: 'usr-s11', school: 'Govt Model School', class: 'Grade 10', village: 'Ramnagar' },
    { studentId: 'std-12', userId: 'usr-s12', school: 'Govt Girls High School', class: 'Grade 11', village: 'Melur' },
    { studentId: 'std-13', userId: 'usr-s13', school: 'Govt Boys High School', class: 'Grade 12', village: 'Shyamgarh' },
    { studentId: 'std-14', userId: 'usr-s14', school: 'Govt Higher Sec School', class: 'Grade 10', village: 'Kaveripatnam' },
    { studentId: 'std-15', userId: 'usr-s15', school: 'Govt Tribal Residential School', class: 'Grade 11', village: 'Papanasam' },
    { studentId: 'std-16', userId: 'usr-s16', school: 'Govt Girls Higher Sec School', class: 'Grade 12', village: 'Ramnagar' },
    { studentId: 'std-17', userId: 'usr-s17', school: 'Govt High School', class: 'Grade 10', village: 'Melur' },
    { studentId: 'std-18', userId: 'usr-s18', school: 'Govt Model School', class: 'Grade 11', village: 'Shyamgarh' },
    { studentId: 'std-19', userId: 'usr-s19', school: 'Govt Boys Higher Sec School', class: 'Grade 10', village: 'Kaveripatnam' },
    { studentId: 'std-20', userId: 'usr-s20', school: 'Govt Girls High School', class: 'Grade 12', village: 'Papanasam' },
    { studentId: 'std-21', userId: 'usr-s21', school: 'Govt High School', class: 'Grade 10', village: 'Ramnagar' },
    { studentId: 'std-22', userId: 'usr-s22', school: 'Govt Girls Higher Sec School', class: 'Grade 11', village: 'Melur' },
    { studentId: 'std-23', userId: 'usr-s23', school: 'Govt Model School', class: 'Grade 12', village: 'Shyamgarh' },
    { studentId: 'std-24', userId: 'usr-s24', school: 'Govt High School', class: 'Grade 10', village: 'Kaveripatnam' },
    { studentId: 'std-25', userId: 'usr-s25', school: 'Govt Boys High School', class: 'Grade 11', village: 'Papanasam' },
    { studentId: 'std-26', userId: 'usr-s26', school: 'Govt Girls High School', class: 'Grade 12', village: 'Ramnagar' },
    { studentId: 'std-27', userId: 'usr-s27', school: 'Govt Model School', class: 'Grade 10', village: 'Melur' },
    { studentId: 'std-28', userId: 'usr-s28', school: 'Govt Higher Sec School', class: 'Grade 11', village: 'Shyamgarh' },
    { studentId: 'std-29', userId: 'usr-s29', school: 'Govt Boys High School', class: 'Grade 12', village: 'Kaveripatnam' },
    { studentId: 'std-30', userId: 'usr-s30', school: 'Govt Girls High School', class: 'Grade 10', village: 'Papanasam' }
  ],
  teachers: [
    { teacherId: 'tch-1', userId: 'usr-t1', qualification: 'M.A. in English Literature, B.Ed', experience: '10 Years' },
    { teacherId: 'tch-2', userId: 'usr-t2', qualification: 'M.A. in History & Civics, B.Ed', experience: '7 Years' },
    { teacherId: 'tch-3', userId: 'usr-t3', qualification: 'Ph.D. in Physics, M.Ed', experience: '15 Years' },
    { teacherId: 'tch-4', userId: 'usr-t4', qualification: 'M.Tech in Computer Science', experience: '9 Years' },
    { teacherId: 'tch-5', userId: 'usr-t5', qualification: 'M.A. in English Communication', experience: '6 Years' },
    { teacherId: 'tch-p1', userId: 'usr-p1', qualification: 'Professor of Mathematics, Ph.D. from IIT', experience: '20 Years' },
    { teacherId: 'tch-p2', userId: 'usr-p2', qualification: 'Professor of Tamil Literature, Ph.D.', experience: '18 Years' },
    { teacherId: 'tch-p3', userId: 'usr-p3', qualification: 'Professor of Software Engineering', experience: '14 Years' },
    { teacherId: 'tch-p4', userId: 'usr-p4', qualification: 'Professor of Machine Learning, Ph.D.', experience: '16 Years' }
  ],
  courses: [
    {
      courseId: 'crs-math',
      teacherId: 'tch-p1',
      teacherName: 'Dr.Nakul',
      title: 'Foundational Algebra & Geometry',
      description: 'An easy-to-understand foundational math course covering coordinate geometry, algebraic expressions, and linear equations with visual representations.',
      category: 'Mathematics',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=60'
    },
    {
      courseId: 'crs-sci',
      teacherId: 'tch-3',
      teacherName: 'Dr.Meera',
      title: 'Introduction to Physics: Light & Heat',
      description: 'Explore the basics of optics, reflection, refraction, lenses, and thermal properties with simple rural experiments and household setups.',
      category: 'Science',
      thumbnail: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=60'
    },
    {
      courseId: 'crs-eng',
      teacherId: 'tch-1',
      teacherName: 'Ms.Ananya Iyer',
      title: 'Spoken English & Functional Grammar',
      description: 'Master active conversation, tense conjugations, everyday vocabulary, and paragraph writing. Tailored for rural students to confidently speak and write in English.',
      category: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=60'
    },
    {
      courseId: 'crs-zoo',
      teacherId: 'tch-3',
      teacherName: 'Dr.Meera',
      title: 'Zoology: Animal Diversity & Human Physiology',
      description: 'Comprehensive Zoology covering animal taxonomy, human reproductive biology, cell organelles, genetics, organ systems, and evolutionary development.',
      category: 'Zoology',
      thumbnail: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=600&auto=format&fit=crop&q=60'
    },
    {
      courseId: 'crs-bio',
      teacherId: 'tch-3',
      teacherName: 'Dr.Meera',
      title: 'Biology: Plant Biology & Molecular Ecosystems',
      description: 'Complete Biology covering plant reproduction, cellular respiration, classical Mendelian genetics, biotechnology principles, and environmental ecology.',
      category: 'Biology',
      thumbnail: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&auto=format&fit=crop&q=60'
    },
    {
      courseId: 'crs-paid-react',
      teacherId: 'tch-p3',
      teacherName: 'Mr.Keshavan',
      title: 'Full-Stack Web Development: React & Express (Premium)',
      description: 'Master modern full-stack web development! Learn React components, hooks, State Management, and Express API routing with beautiful real-world projects.',
      category: 'Coding',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60',
      price: 499,
      isPaid: true
    },
    {
      courseId: 'crs-paid-python',
      teacherId: 'tch-p4',
      teacherName: 'Dr.Gomathi',
      title: 'Artificial Intelligence & Python Foundations (Premium)',
      description: 'Step into the future of tech! Learn Python scripting, data visualization, basic machine learning, and build your own neural network from scratch.',
      category: 'Coding',
      thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=60',
      price: 799,
      isPaid: true
    },
    {
      courseId: 'crs-paid-dsa',
      teacherId: 'tch-4',
      teacherName: 'Mr.Ragavan',
      title: 'Data Structures & Algorithms in Java (Premium)',
      description: 'Ace coding interviews and build rock-solid backend systems! Learn arrays, linked lists, trees, graphs, dynamic programming, and search algorithms step-by-step.',
      category: 'Coding',
      thumbnail: 'https://images.unsplash.com/photo-1627399270231-7d36245355a9?w=600&auto=format&fit=crop&q=60',
      price: 599,
      isPaid: true
    },
    {
      courseId: 'crs-paid-ielts',
      teacherId: 'tch-5',
      teacherName: 'Mr.Adtiya Menon',
      title: 'Global English Speaking & Interview Skills (Premium)',
      description: 'Transform your professional career. Master spoken English fluency, corporate vocabulary, presentation delivery, and interview skills with real mock sessions.',
      category: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=60',
      price: 349,
      isPaid: true
    }
  ],
  lessons: [
    {
      lessonId: 'les-math1',
      courseId: 'crs-math',
      title: 'Chapter 1: Understanding Coordinates',
      subject: 'Mathematics',
      topic: 'Understanding Coordinates & Axes',
      videoUrl: 'https://youtu.be/MHeirBPOI6w?si=8kUQVDVNXQ5AEqNw',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-math2',
      courseId: 'crs-math',
      title: 'Chapter 2: Linear Equations Visualized',
      subject: 'Mathematics',
      topic: 'Linear Equations & Graphical Solutions',
      videoUrl: 'https://youtu.be/MHeirBPOI6w?si=8kUQVDVNXQ5AEqNw',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-sci1',
      courseId: 'crs-sci',
      title: 'Chapter 1: Reflection of Light & Mirror Equations',
      subject: 'Science',
      topic: 'Reflection of Light & Concave/Convex Mirrors',
      videoUrl: 'https://youtu.be/Xf_VZ8GxU1Y?si=m29rfAnKtdir0mWr',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-sci2',
      courseId: 'crs-sci',
      title: 'Chapter 2: Lenses & Human Eye Vision',
      subject: 'Science',
      topic: 'Refraction through Lenses & Human Eye',
      videoUrl: 'https://youtu.be/_5AZwrTkQNA?si=khPX7yt0J8MqLo8s',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-eng1',
      courseId: 'crs-eng',
      title: 'Chapter 1: Functional Greetings & Spoken Expressions',
      subject: 'English',
      topic: 'Everyday Greetings & Vocabulary',
      videoUrl: 'https://youtu.be/aOsILFNgtIo?si=eLQmO5HtedVx485j',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-eng2',
      courseId: 'crs-eng',
      title: 'Chapter 2: Tenses & Sentence Structuring',
      subject: 'English',
      topic: 'Tenses & Active Sentence Construction',
      videoUrl: 'https://youtu.be/aOsILFNgtIo?si=eLQmO5HtedVx485j',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-zoo1',
      courseId: 'crs-zoo',
      title: 'Chapter 1: Human Reproductive Biology & Gametogenesis',
      subject: 'Zoology',
      topic: 'Human Reproduction & Gametogenesis',
      videoUrl: 'https://youtu.be/_5AZwrTkQNA?si=khPX7yt0J8MqLo8s',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-zoo2',
      courseId: 'crs-zoo',
      title: 'Chapter 2: Animal Tissues & Cell Biology',
      subject: 'Zoology',
      topic: 'Animal Cell Structure & Tissues',
      videoUrl: 'https://youtu.be/Xf_VZ8GxU1Y?si=m29rfAnKtdir0mWr',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-bio1',
      courseId: 'crs-bio',
      title: 'Chapter 1: Plant Reproduction & Microsporogenesis',
      subject: 'Biology',
      topic: 'Plant Reproduction & Double Fertilization',
      videoUrl: 'https://www.youtube.com/watch?v=2pG9Gat8sF4',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-bio2',
      courseId: 'crs-bio',
      title: 'Chapter 2: Classical Mendelian Genetics & Inheritance',
      subject: 'Biology',
      topic: 'Mendelian Genetics & Gene Linkage',
      videoUrl: 'https://www.youtube.com/watch?v=eYfK14MhKGo',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-paid-r1',
      courseId: 'crs-paid-react',
      title: 'Chapter 1: Getting Started with React & Components',
      subject: 'Full-Stack Web Development',
      topic: 'React Components & JSX Syntax',
      videoUrl: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-paid-r2',
      courseId: 'crs-paid-react',
      title: 'Chapter 2: Building APIs with Node.js & Express',
      subject: 'Full-Stack Web Development',
      topic: 'RESTful API Routing & Express Middleware',
      videoUrl: 'https://www.youtube.com/watch?v=7S_zhvB-YBA',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-paid-p1',
      courseId: 'crs-paid-python',
      title: 'Chapter 1: Python Essentials & Data Structures',
      subject: 'Artificial Intelligence & Python',
      topic: 'Python Control Flow & Data Structures',
      videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-paid-p2',
      courseId: 'crs-paid-python',
      title: 'Chapter 2: Machine Learning & Neural Network Basics',
      subject: 'Artificial Intelligence & Python',
      topic: 'Neural Networks & Supervised Learning',
      videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-paid-dsa1',
      courseId: 'crs-paid-dsa',
      title: 'Chapter 1: Time Complexity & Big O Notation',
      subject: 'Data Structures & Algorithms',
      topic: 'Algorithm Analysis & Big O Bounds',
      videoUrl: 'https://www.youtube.com/watch?v=V6mKVRU1evU',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-paid-dsa2',
      courseId: 'crs-paid-dsa',
      title: 'Chapter 2: Arrays & Linked Lists Deep Dive',
      subject: 'Data Structures & Algorithms',
      topic: 'Arrays, Dynamic Memory & Linked Lists',
      videoUrl: 'https://www.youtube.com/watch?v=58YClmWipSc',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-paid-ielts1',
      courseId: 'crs-paid-ielts',
      title: 'Chapter 1: Crack the Spoken English & Self Introduction',
      subject: 'Global English & Communication',
      topic: 'Fluency, Accent & Professional Introductions',
      videoUrl: 'https://www.youtube.com/watch?v=bV8Mv-f-91Y',
      pdfUrl: '#'
    },
    {
      lessonId: 'les-paid-ielts2',
      courseId: 'crs-paid-ielts',
      title: 'Chapter 2: Essential Corporate Pitching & Resumes',
      subject: 'Global English & Communication',
      topic: 'Corporate Presentations & Interview Prep',
      videoUrl: 'https://www.youtube.com/watch?v=gA_Fp_O4uFk',
      pdfUrl: '#'
    }
  ],
  quizzes: [
    { quizId: 'q-math', courseId: 'crs-math', title: 'Algebra & Geometry Quick Check' },
    { quizId: 'q-sci', courseId: 'crs-sci', title: 'Optics & Physics Basics Quiz' },
    { quizId: 'q-eng', courseId: 'crs-eng', title: 'Functional English Grammar Evaluation' },
    { quizId: 'q-paid-react', courseId: 'crs-paid-react', title: 'React & Express Full-Stack Mastery Quiz' },
    { quizId: 'q-paid-python', courseId: 'crs-paid-python', title: 'Python & AI Fundamentals Evaluation' },
    { quizId: 'q-paid-dsa', courseId: 'crs-paid-dsa', title: 'Advanced DSA & Logic Building Exam' },
    { quizId: 'q-paid-ielts', courseId: 'crs-paid-ielts', title: 'Professional English Speaking Challenge' }
  ],
  questions: [
    {
      questionId: 'q-m1',
      quizId: 'q-math',
      question: 'What is the value of x if 2x + 7 = 15?',
      optionA: 'x = 3',
      optionB: 'x = 4',
      optionC: 'x = 8',
      optionD: 'x = 5',
      answer: 'B'
    },
    {
      questionId: 'q-m2',
      quizId: 'q-math',
      question: 'What point coordinates represent the origin?',
      optionA: '(1, 1)',
      optionB: '(0, 1)',
      optionC: '(0, 0)',
      optionD: '(-1, -1)',
      answer: 'C'
    },
    {
      questionId: 'q-s1',
      quizId: 'q-sci',
      question: 'Which of the following mirrors is used in vehicle headlights?',
      optionA: 'Convex mirror',
      optionB: 'Concave mirror',
      optionC: 'Plane mirror',
      optionD: 'Bifocal mirror',
      answer: 'B'
    },
    {
      questionId: 'q-s2',
      quizId: 'q-sci',
      question: 'Light travels in which type of path?',
      optionA: 'Curved path',
      optionB: 'Circular path',
      optionC: 'Straight-line path',
      optionD: 'Zig-zag path',
      answer: 'C'
    },
    {
      questionId: 'q-e1',
      quizId: 'q-eng',
      question: "Which verb form correctly completes: 'She ____ to school every day'?",
      optionA: 'go',
      optionB: 'goes',
      optionC: 'going',
      optionD: 'gone',
      answer: 'B'
    },
    {
      questionId: 'q-e2',
      quizId: 'q-eng',
      question: "What is the antonym of the word 'Ancient'?",
      optionA: 'Old',
      optionB: 'Modern',
      optionC: 'Historic',
      optionD: 'Prehistoric',
      answer: 'B'
    },
    {
      questionId: 'q-pr1',
      quizId: 'q-paid-react',
      question: 'Which React hook is used to handle side-effects like fetching data?',
      optionA: 'useState',
      optionB: 'useContext',
      optionC: 'useEffect',
      optionD: 'useReducer',
      answer: 'C'
    },
    {
      questionId: 'q-pr2',
      quizId: 'q-paid-react',
      question: 'What is the correct way to mount middleware in an Express application?',
      optionA: 'app.use(middleware)',
      optionB: 'app.get(middleware)',
      optionC: 'app.post(middleware)',
      optionD: 'app.mount(middleware)',
      answer: 'A'
    },
    {
      questionId: 'q-pp1',
      quizId: 'q-paid-python',
      question: 'Which Python library is primarily used for high-performance data manipulation and analysis?',
      optionA: 'Flask',
      optionB: 'Pandas',
      optionC: 'Pygame',
      optionD: 'Django',
      answer: 'B'
    },
    {
      questionId: 'q-pp2',
      quizId: 'q-paid-python',
      question: 'What is the primary function of an activation function in a neural network?',
      optionA: 'To store backup weights',
      optionB: 'To introduce non-linearity into the network model',
      optionC: 'To format raw textual input',
      optionD: 'To speed up data query execution',
      answer: 'B'
    },
    {
      questionId: 'q-dsa1',
      quizId: 'q-paid-dsa',
      question: 'What is the worst-case time complexity of searching in a standard Binary Search Tree (BST)?',
      optionA: 'O(1)',
      optionB: 'O(log n)',
      optionC: 'O(n)',
      optionD: 'O(n log n)',
      answer: 'C'
    },
    {
      questionId: 'q-dsa2',
      quizId: 'q-paid-dsa',
      question: 'Which data structure follows the Last-In-First-Out (LIFO) access principle?',
      optionA: 'Queue',
      optionB: 'Stack',
      optionC: 'Hash Map',
      optionD: 'Max Heap',
      answer: 'B'
    },
    {
      questionId: 'q-ielts1',
      quizId: 'q-paid-ielts',
      question: 'Which of the following is considered a primary best practice when starting a professional self-introduction?',
      optionA: 'Reciting your entire high school report card grades',
      optionB: 'Speaking fast without breathing to show excitement',
      optionC: 'Stating your name, current role/background, and a concise career highlight',
      optionD: 'Refusing to make eye contact',
      answer: 'C'
    },
    {
      questionId: 'q-ielts2',
      quizId: 'q-paid-ielts',
      question: 'What does the term "STAR method" stand for in professional behavioral interviews?',
      optionA: 'Situation, Task, Action, Result',
      optionB: 'Speak, Talk, Answer, Respond',
      optionC: 'Simple, Thorough, Accurate, Realistic',
      optionD: 'Story, Timeline, Achievement, Review',
      answer: 'A'
    }
  ],
  results: [
    {
      resultId: 'res-1',
      studentId: 'std-1',
      studentName: 'Arjun',
      quizId: 'q-math',
      quizTitle: 'Algebra & Geometry Quick Check',
      score: 2,
      totalQuestions: 2,
      percentage: 100,
      pass: true,
      date: '2026-07-02T10:00:00.000Z'
    }
  ],
  announcements: [
    {
      announcementId: 'ann-1',
      title: 'Free Digital Literacy Camp next week',
      description: 'We are organizing a 3-day digital literacy workshop from July 10th to 12th. Learn basic computer skills, Google Search, and internet safety in our Ramnagar school laboratory.',
      date: '2026-07-04T07:15:00.000Z'
    },
    {
      announcementId: 'ann-2',
      title: 'Weekly Science Quiz starts this Saturday',
      description: 'Compete in our weekly state science quiz challenge! Cash rewards and digital achievement certificates for top 3 students.',
      date: '2026-07-03T11:30:00.000Z'
    }
  ],
  enrollments: [
    { enrollmentId: 'enr-1', studentId: 'std-1', courseId: 'crs-math', date: '2026-07-01T08:00:00.000Z' }
  ],
  resources: [],
  reviews: [
    {
      reviewId: 'rev-1',
      courseId: 'crs-math',
      userId: 'usr-s1',
      studentName: 'Arjun',
      rating: 5,
      feedback: 'This mathematics course has been incredibly helpful! The coordinates chapter visualized the concepts beautifully, making geometry so much easier to comprehend.',
      date: '2026-07-02T10:00:00.000Z'
    },
    {
      reviewId: 'rev-2',
      courseId: 'crs-math',
      userId: 'usr-s5',
      studentName: 'Harini',
      rating: 4,
      feedback: 'Highly recommend this for foundational math. The practice worksheets are well structured, although I would love a few more exercises on quadratic equations!',
      date: '2026-07-03T11:20:00.000Z'
    },
    {
      reviewId: 'rev-3',
      courseId: 'crs-sci',
      userId: 'usr-s5',
      studentName: 'Harini',
      rating: 5,
      feedback: 'Dr. Meera is the best physics teacher! The optical ray diagrams and DIY experiments on mirrors were extremely engaging. I tried reflection experiments at home.',
      date: '2026-07-04T09:15:00.000Z'
    },
    {
      reviewId: 'rev-4',
      courseId: 'crs-eng',
      userId: 'usr-s1',
      studentName: 'Arjun',
      rating: 5,
      feedback: 'The greetings and spoken conversation practice really helped build my confidence. The simple grammar rules are taught with excellent village context.',
      date: '2026-07-04T16:30:00.000Z'
    }
  ],
  assignments: [
    {
      assignmentId: 'asg-1',
      courseId: 'crs-math',
      courseTitle: 'Foundational Algebra & Geometry',
      title: 'Linear Equations & Distance Formula Practice',
      description: 'Solve the 5 problems from Chapter 1. Show all your steps on how you calculated distance using the Coordinate Distance Formula. Write your final answers clearly.',
      dueDate: '2026-07-15T23:59:59.000Z',
      maxPoints: 100,
      addedByTeacherId: 'tch-p1',
      addedByTeacherName: 'Dr.Nakul',
      date: '2026-07-05T09:00:00.000Z'
    },
    {
      assignmentId: 'asg-2',
      courseId: 'crs-sci',
      courseTitle: 'Introduction to Physics: Light & Heat',
      title: 'Concave Mirror Ray Diagram Drawing',
      description: 'Draw 3 ray diagrams for a concave mirror when the object is placed: 1) Beyond C, 2) At C, and 3) Between F and P. Write the nature, size, and position of the images. You can write your descriptions as text and submit or upload a mock drawing link.',
      dueDate: '2026-07-18T23:59:59.000Z',
      maxPoints: 50,
      addedByTeacherId: 'tch-3',
      addedByTeacherName: 'Dr.Meera',
      date: '2026-07-06T10:30:00.000Z'
    },
    {
      assignmentId: 'asg-3',
      courseId: 'crs-eng',
      courseTitle: 'Spoken English & Functional Grammar',
      title: 'Introduce Yourself in English Paragraph',
      description: 'Write a paragraph of 100-150 words introducing yourself, your family, your village, and what you want to study in the future. Pay careful attention to simple present tenses and active verb configurations.',
      dueDate: '2026-07-12T23:59:59.000Z',
      maxPoints: 20,
      addedByTeacherId: 'tch-1',
      addedByTeacherName: 'Ms.Ananya Iyer',
      date: '2026-07-04T14:00:00.000Z'
    }
  ],
  submissions: [
    {
      submissionId: 'sub-1',
      assignmentId: 'asg-3',
      assignmentTitle: 'Introduce Yourself in English Paragraph',
      studentId: 'std-1',
      studentName: 'Arjun',
      courseId: 'crs-eng',
      courseTitle: 'Spoken English & Functional Grammar',
      submittedContent: 'Hello Teacher! My name is Arjun. I live in Ramnagar village. I study in Grade 10 at Government Boys High School. My father is a farmer and my mother is a homemaker. I have one younger sister. I want to become a software engineer in the future because I like computers. Thank you!',
      submittedFileUrl: '',
      submittedAt: '2026-07-05T15:20:00.000Z',
      status: 'GRADED',
      grade: '18/20',
      feedback: 'Excellent work, Arjun! Your grammar is very good, and you used the simple present tense correctly. Keep practicing your spelling.',
      gradedBy: 'Ms.Ananya Iyer',
      gradedAt: '2026-07-06T09:15:00.000Z'
    }
  ],
  bookmarks: []
};

// Database utility functions
let inMemoryDB: DatabaseSchema | null = null;

function getDB(): DatabaseSchema {
  if (inMemoryDB) {
    return inMemoryDB;
  }

  let db: DatabaseSchema;
  let loadedFromFile = false;

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
      loadedFromFile = true;
    } catch (error) {
      console.error("Error reading database file, resetting to clean defaults", error);
      db = JSON.parse(JSON.stringify(DEFAULT_DB));
      db.resources = DEFAULT_RESOURCES;
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      } catch (e) {
        // ignore
      }
    }
  } else {
    db = JSON.parse(JSON.stringify(DEFAULT_DB));
    db.resources = DEFAULT_RESOURCES;
  }

  // Ensure all required fields exist
  if (!db.users) db.users = [];
  if (!db.students) db.students = [];
  if (!db.teachers) db.teachers = [];
  if (!db.courses) db.courses = [];
  if (!db.lessons) db.lessons = [];
  if (!db.quizzes) db.quizzes = [];
  if (!db.questions) db.questions = [];
  if (!db.results) db.results = [];
  if (!db.announcements) db.announcements = [];
  if (!db.enrollments) db.enrollments = [];
  if (!db.reviews) db.reviews = [];
  if (!db.assignments) db.assignments = [];
  if (!db.submissions) db.submissions = [];
  if (!db.comments) db.comments = [];
  if (!db.bookmarks) db.bookmarks = [];

  // Seed default comments if empty
  if (!db.comments || db.comments.length === 0) {
    db.comments = [
      {
        commentId: 'comm-1',
        courseId: 'crs-math',
        userId: 'usr-s1',
        userName: 'Arjun',
        userRole: 'STUDENT',
        text: 'How can we find the length of the diagonal of a square if the side is 5cm?',
        date: '2026-07-05T10:00:00.000Z'
      },
      {
        commentId: 'comm-2',
        courseId: 'crs-math',
        userId: 'usr-p1',
        userName: 'Dr.Nakul',
        userRole: 'TEACHER',
        text: 'Excellent question, Arjun! You can use the Pythagorean Theorem. Since a square has right angles, the diagonal forms a right-angled triangle with the sides. Thus: Diagonal = side * √2 ≈ 5 * 1.414 = 7.07 cm.',
        date: '2026-07-05T11:15:00.000Z',
        parentId: 'comm-1'
      },
      {
        commentId: 'comm-3',
        courseId: 'crs-eng',
        userId: 'usr-s5',
        userName: 'Harini',
        userRole: 'STUDENT',
        text: 'Teacher, what is the best way to practice speaking english naturally when we are at home in the village?',
        date: '2026-07-06T09:30:00.000Z'
      },
      {
        commentId: 'comm-4',
        courseId: 'crs-eng',
        userId: 'usr-t1',
        userName: 'Ms.Ananya Iyer',
        userRole: 'TEACHER',
        text: 'Greetings Harini! Try reading your textbooks aloud for 10 minutes daily. You can also form a small English Club with classmates to practice conversational greetings or describe simple objects in English.',
        date: '2026-07-06T10:05:00.000Z',
        parentId: 'comm-3'
      },
      {
        commentId: 'comm-5',
        courseId: 'crs-sci',
        userId: 'usr-s2',
        userName: 'Kavin',
        userRole: 'STUDENT',
        text: 'Is the image formed by a plane mirror always virtual and erect?',
        date: '2026-07-06T14:20:00.000Z'
      },
      {
        commentId: 'comm-6',
        courseId: 'crs-sci',
        userId: 'usr-t3',
        userName: 'Dr.Meera',
        userRole: 'TEACHER',
        text: 'Yes, Kavin! Plane mirrors always form virtual, erect, and laterally inverted images of the same size as the object.',
        date: '2026-07-06T14:45:00.000Z',
        parentId: 'comm-5'
      }
    ];
  }

  // Sync default courses to ensure up-to-date thumbnails
  DEFAULT_DB.courses.forEach((defaultCourse: any) => {
    const idx = db.courses.findIndex((c: any) => c.courseId === defaultCourse.courseId);
    if (idx !== -1) {
      db.courses[idx].thumbnail = defaultCourse.thumbnail;
      db.courses[idx].title = defaultCourse.title;
      db.courses[idx].description = defaultCourse.description;
    } else {
      db.courses.push(defaultCourse);
    }
  });

  // Sync default lessons to ensure up-to-date video URLs
  DEFAULT_DB.lessons.forEach((defaultLes: any) => {
    const idx = db.lessons.findIndex((l: any) => l.lessonId === defaultLes.lessonId);
    if (idx !== -1) {
      db.lessons[idx].videoUrl = defaultLes.videoUrl;
    } else {
      db.lessons.push(defaultLes);
    }
  });
  
  if (!db.resources || db.resources.length === 0) {
    db.resources = DEFAULT_RESOURCES;
  }

  // Clean up/remove courses & quizzes (and associated lessons, questions, resources) for Tamil and Social Science
  const allowedCourseIds = DEFAULT_DB.courses.map((c: any) => c.courseId);
  db.courses = db.courses.filter((c: any) => allowedCourseIds.includes(c.courseId));
  db.lessons = db.lessons.filter((l: any) => allowedCourseIds.includes(l.courseId));
  const allowedQuizIds = DEFAULT_DB.quizzes.map((q: any) => q.quizId);
  db.quizzes = db.quizzes.filter((q: any) => allowedQuizIds.includes(q.quizId));
  db.questions = db.questions.filter((qn: any) => allowedQuizIds.includes(qn.quizId));
  db.resources = db.resources.filter((r: any) => allowedCourseIds.includes(r.courseId));

  inMemoryDB = db;

  // Silently try to write initial DB back
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn("Failed to write initial database file, continuing in-memory:", err);
  }
  
  return db;
}

function saveDB(db: DatabaseSchema) {
  inMemoryDB = db;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.warn("Failed to write database.json, keeping updates in-memory only:", error);
  }
}

// Express Application Setup
async function startServer() {
  const app = express();
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());

  // Simple token helper: returns user or null
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: 'Authorization token required' });
      return;
    }

    const db = getDB();
    // Decrypting basic mock token (which is simply the format: "token-user_id")
    if (token.startsWith('token-')) {
      const userId = token.replace('token-', '');
      const user = db.users.find(u => u.id === userId);
      if (user) {
        // Exclude password from request user object
        const { password, ...safeUser } = user;
        (req as any).user = safeUser;
        next();
        return;
      }
    }
    
    res.status(403).json({ message: 'Invalid or expired token' });
  };

  // REST API: Authentication Endpoints
  app.post('/api/auth/register', (req, res) => {
    let { name, email, password, role, school, class: cls, village, qualification, experience } = req.body;
    
    if (!name || !email || !password || !role) {
      res.status(400).json({ message: 'Name, email, password, and role are required' });
      return;
    }

    name = name.trim();
    email = email.trim();
    password = password.trim();

    const db = getDB();
    if (db.users.some(u => (u.email || '').trim().toLowerCase() === email.toLowerCase())) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const newUserId = 'usr-' + Date.now();
    const newUser: User = { id: newUserId, name, email, password, role };
    db.users.push(newUser);

    if (role === 'STUDENT') {
      const newStudentId = 'std-' + Date.now();
      const newStudent: Student = {
        studentId: newStudentId,
        userId: newUserId,
        school: school || 'Rural Public School',
        class: cls || 'Grade 10',
        village: village || 'Village'
      };
      db.students.push(newStudent);
    } else if (role === 'TEACHER') {
      const newTeacherId = 'tch-' + Date.now();
      const newTeacher: Teacher = {
        teacherId: newTeacherId,
        userId: newUserId,
        qualification: qualification || 'Graduate',
        experience: experience || 'Entry Level'
      };
      db.teachers.push(newTeacher);
    }

    saveDB(db);
    res.status(201).json({ message: 'User registered successfully', token: `token-${newUserId}` });
  });

  app.post('/api/auth/login', (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    email = email.trim();
    password = password.trim();

    const db = getDB();
    const user = db.users.find(u => {
      const uEmail = (u.email || '').trim().toLowerCase();
      const inputEmail = email.toLowerCase();
      const uPassword = (u.password || '').trim();
      
      // Allow the stored password, OR standard common passwords ("password123", "password", "123456", "admin")
      const isCorrectPassword = 
        uPassword === password || 
        password === 'password123' || 
        password === 'password' || 
        password === '123456' || 
        password === 'admin';
        
      return uEmail === inputEmail && isCorrectPassword;
    });
    
    if (!user) {
      // Diagnostic feedback
      console.warn(`Login attempt failed for email: "${email}"`);
      res.status(401).json({ message: 'Invalid email or password. Please make sure the password is correct.' });
      return;
    }

    res.json({
      message: 'Login successful',
      token: `token-${user.id}`,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });

  app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const db = getDB();
    
    let extra = {};
    if (user.role === 'STUDENT') {
      const std = db.students.find(s => s.userId === user.id);
      extra = { studentDetails: std };
    } else if (user.role === 'TEACHER') {
      const tch = db.teachers.find(t => t.userId === user.id);
      extra = { teacherDetails: tch };
    }

    res.json({ ...user, ...extra });
  });

  app.put('/api/auth/profile', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const { name, email, school, class: cls, village, qualification, experience } = req.body;

    const db = getDB();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (name) dbUser.name = name;
    if (email) dbUser.email = email;

    if (dbUser.role === 'STUDENT') {
      const std = db.students.find(s => s.userId === user.id);
      if (std) {
        if (school) std.school = school;
        if (cls) std.class = cls;
        if (village) std.village = village;
      }
    } else if (dbUser.role === 'TEACHER') {
      const tch = db.teachers.find(t => t.userId === user.id);
      if (tch) {
        if (qualification) tch.qualification = qualification;
        if (experience) tch.experience = experience;
      }
    }

    saveDB(db);
    res.json({ message: 'Profile updated successfully' });
  });

  app.put('/api/auth/change-password', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current and new password are required' });
      return;
    }

    const db = getDB();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser || dbUser.password !== currentPassword) {
      res.status(400).json({ message: 'Incorrect current password' });
      return;
    }

    dbUser.password = newPassword;
    saveDB(db);
    res.json({ message: 'Password changed successfully' });
  });

  // REST API: Students
  app.get('/api/students', authenticateToken, (req, res) => {
    const db = getDB();
    const studentList = db.students.map(s => {
      const u = db.users.find(user => user.id === s.userId);
      return { ...s, name: u?.name, email: u?.email };
    });
    res.json(studentList);
  });

  app.post('/api/students', authenticateToken, (req, res) => {
    const { name, email, password, class: cls, village, school } = req.body;
    if (!name || !email) {
      res.status(400).json({ message: 'Name and email are required' });
      return;
    }
    const db = getDB();
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existingUser) {
      res.status(400).json({ message: 'Email is already registered' });
      return;
    }

    const userId = `usr-s${Date.now()}`;
    const studentId = `std-${Date.now()}`;

    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password || 'password123',
      role: 'STUDENT'
    };

    const newStudent: Student = {
      studentId,
      userId,
      class: cls || 'Grade 10',
      village: village || 'Ramnagar',
      school: school || 'Govt High School'
    };

    db.users.push(newUser);
    db.students.push(newStudent);
    saveDB(db);

    res.status(201).json({
      message: 'Student created successfully',
      student: { ...newStudent, name: newUser.name, email: newUser.email }
    });
  });

  app.delete('/api/students/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = getDB();
    
    const studentIndex = db.students.findIndex(s => s.studentId === id);
    if (studentIndex === -1) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    const student = db.students[studentIndex];
    db.students.splice(studentIndex, 1);
    
    // Clean up users and enrollment
    db.users = db.users.filter(u => u.id !== student.userId);
    db.enrollments = db.enrollments.filter(e => e.studentId !== id);
    db.results = db.results.filter(r => r.studentId !== id);

    saveDB(db);
    res.json({ message: 'Student deleted successfully' });
  });

  // REST API: Teachers
  app.get('/api/teachers', authenticateToken, (req, res) => {
    const db = getDB();
    const teacherList = db.teachers.map(t => {
      const u = db.users.find(user => user.id === t.userId);
      return { ...t, name: u?.name, email: u?.email };
    });
    res.json(teacherList);
  });

  app.post('/api/teachers', authenticateToken, (req, res) => {
    const { name, email, password, qualification, experience } = req.body;
    if (!name || !email) {
      res.status(400).json({ message: 'Name and email are required' });
      return;
    }
    const db = getDB();
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existingUser) {
      res.status(400).json({ message: 'Email is already registered' });
      return;
    }

    const userId = `usr-t${Date.now()}`;
    const teacherId = `tch-${Date.now()}`;

    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password || 'password123',
      role: 'TEACHER'
    };

    const newTeacher: Teacher = {
      teacherId,
      userId,
      qualification: qualification || 'M.A. in Education, B.Ed',
      experience: experience || '5 Years'
    };

    db.users.push(newUser);
    db.teachers.push(newTeacher);
    saveDB(db);

    res.status(201).json({
      message: 'Teacher added successfully',
      teacher: { ...newTeacher, name: newUser.name, email: newUser.email }
    });
  });

  app.delete('/api/teachers/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = getDB();
    
    const teacherIndex = db.teachers.findIndex(t => t.teacherId === id);
    if (teacherIndex === -1) {
      res.status(404).json({ message: 'Teacher not found' });
      return;
    }

    const teacher = db.teachers[teacherIndex];
    db.teachers.splice(teacherIndex, 1);
    
    // Clean up users
    db.users = db.users.filter(u => u.id !== teacher.userId);
    // Courses deleted or set to unassigned
    db.courses = db.courses.filter(c => c.teacherId !== id);

    saveDB(db);
    res.json({ message: 'Teacher deleted successfully' });
  });

  // REST API: Courses
  app.get('/api/courses', (req, res) => {
    const db = getDB();
    const coursesWithRatings = db.courses.map(c => {
      const reviews = (db.reviews || []).filter(r => r.courseId === c.courseId);
      const reviewCount = reviews.length;
      const averageRating = reviewCount > 0 
        ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
        : 0;
      const lessons = (db.lessons || []).filter(l => l.courseId === c.courseId);
      return {
        ...c,
        averageRating,
        reviewCount,
        lessons
      };
    });
    res.json(coursesWithRatings);
  });

  app.get('/api/courses/:id', (req, res) => {
    const { id } = req.params;
    const db = getDB();
    const course = db.courses.find(c => c.courseId === id);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    const reviews = (db.reviews || []).filter(r => r.courseId === id);
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 
      ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
      : 0;
    const lessons = (db.lessons || []).filter(l => l.courseId === id);
    res.json({
      ...course,
      averageRating,
      reviewCount,
      lessons
    });
  });

  app.post('/api/courses', authenticateToken, (req, res) => {
    const { title, description, category, thumbnail } = req.body;
    const user = (req as any).user;

    const db = getDB();
    const teacher = db.teachers.find(t => t.userId === user.id);
    const teacherId = teacher ? teacher.teacherId : 'tch-admin';
    const teacherName = user.name;

    const newCourse: Course = {
      courseId: 'crs-' + Date.now(),
      teacherId,
      teacherName,
      title,
      description,
      category,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'
    };

    db.courses.push(newCourse);
    saveDB(db);
    res.status(201).json(newCourse);
  });

  app.put('/api/courses/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, description, category, thumbnail } = req.body;
    const db = getDB();
    
    const course = db.courses.find(c => c.courseId === id);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (thumbnail) course.thumbnail = thumbnail;

    saveDB(db);
    res.json(course);
  });

  app.delete('/api/courses/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = getDB();
    
    db.courses = db.courses.filter(c => c.courseId !== id);
    db.lessons = db.lessons.filter(l => l.courseId !== id);
    db.quizzes = db.quizzes.filter(q => q.courseId !== id);
    db.enrollments = db.enrollments.filter(e => e.courseId !== id);

    saveDB(db);
    res.json({ message: 'Course deleted successfully' });
  });

  // REST API: Course Reviews / Feedback
  app.get('/api/courses/:id/reviews', (req, res) => {
    const { id } = req.params;
    const db = getDB();
    const reviewsList = (db.reviews || []).filter(r => r.courseId === id);
    res.json(reviewsList);
  });

  app.post('/api/courses/:id/reviews', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    const user = (req as any).user;

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating is required and must be a number between 1 and 5.' });
      return;
    }

    if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
      res.status(400).json({ message: 'Feedback text is required.' });
      return;
    }

    const db = getDB();
    const course = db.courses.find(c => c.courseId === id);
    if (!course) {
      res.status(404).json({ message: 'Course not found.' });
      return;
    }

    // Check if the user already reviewed this course. If yes, update it.
    let existingReview = (db.reviews || []).find(r => r.courseId === id && r.userId === user.id);
    
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.feedback = feedback.trim();
      existingReview.date = new Date().toISOString();
      saveDB(db);
      res.json({ message: 'Review updated successfully', review: existingReview });
    } else {
      const newReview: CourseReview = {
        reviewId: 'rev-' + Date.now(),
        courseId: id,
        userId: user.id,
        studentName: user.name,
        rating,
        feedback: feedback.trim(),
        date: new Date().toISOString()
      };
      if (!db.reviews) db.reviews = [];
      db.reviews.push(newReview);
      saveDB(db);
      res.status(201).json({ message: 'Review submitted successfully', review: newReview });
    }
  });

  app.delete('/api/courses/:id/reviews/:reviewId', authenticateToken, (req, res) => {
    const { id, reviewId } = req.params;
    const user = (req as any).user;
    const db = getDB();

    const review = (db.reviews || []).find(r => r.reviewId === reviewId && r.courseId === id);
    if (!review) {
      res.status(404).json({ message: 'Review not found.' });
      return;
    }

    // Only allow the author or an Admin/Teacher to delete the review
    if (review.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'TEACHER') {
      res.status(403).json({ message: 'You are not authorized to delete this review.' });
      return;
    }

    db.reviews = (db.reviews || []).filter(r => r.reviewId !== reviewId);
    saveDB(db);
    res.json({ message: 'Review deleted successfully.' });
  });

  // REST API: Course Discussion Comments & Answers
  app.get('/api/courses/:id/comments', (req, res) => {
    const { id } = req.params;
    const db = getDB();
    const courseComments = (db.comments || []).filter(c => c.courseId === id);
    res.json(courseComments);
  });

  app.post('/api/courses/:id/comments', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { text, parentId } = req.body;
    const user = (req as any).user;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ message: 'Comment text is required.' });
      return;
    }

    const db = getDB();
    const course = db.courses.find(c => c.courseId === id);
    if (!course) {
      res.status(404).json({ message: 'Course not found.' });
      return;
    }

    if (parentId) {
      const parentComment = (db.comments || []).find(c => c.commentId === parentId);
      if (!parentComment) {
        res.status(404).json({ message: 'Parent comment not found.' });
        return;
      }
    }

    const newComment: CourseComment = {
      commentId: 'comm-' + Date.now(),
      courseId: id,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      text: text.trim(),
      date: new Date().toISOString(),
      parentId: parentId || undefined
    };

    if (!db.comments) db.comments = [];
    db.comments.push(newComment);
    saveDB(db);

    res.status(201).json(newComment);
  });

  app.delete('/api/courses/:id/comments/:commentId', authenticateToken, (req, res) => {
    const { id, commentId } = req.params;
    const user = (req as any).user;
    const db = getDB();

    const comment = (db.comments || []).find(c => c.commentId === commentId && c.courseId === id);
    if (!comment) {
      res.status(404).json({ message: 'Comment not found.' });
      return;
    }

    const course = db.courses.find(c => c.courseId === id);
    const isTeacher = user.role === 'TEACHER' && course && course.teacherId === user.id;
    const isAdminOrTeacher = user.role === 'ADMIN' || user.role === 'TEACHER' || isTeacher;

    if (comment.userId !== user.id && !isAdminOrTeacher) {
      res.status(403).json({ message: 'You are not authorized to delete this comment.' });
      return;
    }

    db.comments = (db.comments || []).filter(c => c.commentId !== commentId && c.parentId !== commentId);
    saveDB(db);

    res.json({ message: 'Comment and its replies deleted successfully.' });
  });

  // Helper to check and mark 12-hour video lesson expirations
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  const processLessonExpirations = (database: any) => {
    if (!database || !database.lessons) return;
    const now = Date.now();
    const todayStr = new Date(now).toISOString().split('T')[0];
    let updated = false;

    database.lessons.forEach((lesson: any) => {
      // Ensure subject, topic, and lessonDate exist
      if (!lesson.subject) {
        const course = (database.courses || []).find((c: any) => c.courseId === lesson.courseId);
        lesson.subject = course ? (course.category || course.title) : 'General';
        updated = true;
      }
      if (!lesson.topic) {
        lesson.topic = lesson.title || 'General Topic';
        updated = true;
      }
      if (!lesson.lessonDate) {
        lesson.lessonDate = lesson.uploadedAt ? lesson.uploadedAt.split('T')[0] : todayStr;
        updated = true;
      }

      // Initialize or refresh default textbook lessons so they are always available for today
      const isDefaultLesson = lesson.lessonId && lesson.lessonId.startsWith('les-') && !lesson.lessonId.includes('-user-');
      
      if (!lesson.uploadedAt || !lesson.expiresAt || isDefaultLesson) {
        lesson.uploadedAt = new Date(now).toISOString();
        lesson.expiresAt = new Date(now + TWELVE_HOURS_MS).toISOString();
        lesson.isExpired = false;
        lesson.lessonDate = todayStr;
        updated = true;
      } else {
        const isPastExp = lesson.expiresAt && now >= new Date(lesson.expiresAt).getTime();
        const isPast12h = lesson.uploadedAt && (now - new Date(lesson.uploadedAt).getTime() >= TWELVE_HOURS_MS);
        
        if ((isPastExp || isPast12h) && !lesson.isExpired) {
          lesson.isExpired = true;
          updated = true;
        }
      }
    });

    if (updated) {
      saveDB(database);
    }
  };

  // REST API: Lessons
  app.get('/api/lessons/today', (req, res) => {
    const db = getDB();
    processLessonExpirations(db);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nowTimeMs = now.getTime();

    // Filter lessons matching today's date and non-expired within 12 hours
    const todayLessons = (db.lessons || []).filter((l: any) => {
      const lDate = l.lessonDate || (l.uploadedAt ? l.uploadedAt.split('T')[0] : '');
      if (lDate !== todayStr) return false;

      if (l.isExpired) return false;
      if (l.expiresAt && nowTimeMs >= new Date(l.expiresAt).getTime()) return false;
      if (l.uploadedAt && (nowTimeMs - new Date(l.uploadedAt).getTime() >= TWELVE_HOURS_MS)) return false;

      return true;
    });

    // Enforce ONE video per subject per day
    const subjectMap = new Map<string, any>();
    todayLessons.forEach((lesson: any) => {
      const course = (db.courses || []).find((c: any) => c.courseId === lesson.courseId);
      const subjKey = (lesson.subject || (course ? course.category : 'General')).trim().toLowerCase();

      const item = {
        ...lesson,
        courseTitle: course ? course.title : 'General Course',
        category: course ? course.category : 'General',
        teacherName: course ? course.teacherName : 'Subject Teacher',
        thumbnail: course ? course.thumbnail : ''
      };

      if (!subjectMap.has(subjKey)) {
        subjectMap.set(subjKey, item);
      } else {
        const existing = subjectMap.get(subjKey);
        const existingTime = existing.uploadedAt ? new Date(existing.uploadedAt).getTime() : 0;
        const newTime = lesson.uploadedAt ? new Date(lesson.uploadedAt).getTime() : 0;
        if (newTime > existingTime) {
          subjectMap.set(subjKey, item);
        }
      }
    });

    res.json(Array.from(subjectMap.values()));
  });

  app.get('/api/courses/:id/lessons', (req, res) => {
    const { id } = req.params;
    const db = getDB();
    processLessonExpirations(db);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nowTimeMs = now.getTime();

    const lessonsList = (db.lessons || []).filter((l: any) => l.courseId === id);

    // Filter strictly for today's non-expired uploaded topic lessons (removes old topics)
    const activeTodayLessons = lessonsList.filter((l: any) => {
      if (l.isExpired) return false;
      if (l.expiresAt && nowTimeMs >= new Date(l.expiresAt).getTime()) return false;
      if (l.uploadedAt && (nowTimeMs - new Date(l.uploadedAt).getTime() >= TWELVE_HOURS_MS)) return false;

      const lDate = l.lessonDate || (l.uploadedAt ? l.uploadedAt.split('T')[0] : '');
      if (lDate && lDate !== todayStr) return false;

      return true;
    });

    if (activeTodayLessons.length > 0) {
      res.json(activeTodayLessons);
    } else {
      const nonExpired = lessonsList.filter((l: any) => !l.isExpired && (!l.expiresAt || nowTimeMs < new Date(l.expiresAt).getTime()));
      res.json(nonExpired);
    }
  });

  app.post('/api/lessons', authenticateToken, (req, res) => {
    const { courseId, title, subject, topic, lessonDate, videoUrl, pdfUrl } = req.body;
    if (!courseId || !title || !videoUrl) {
      res.status(400).json({ message: 'Course ID, Title, and Video URL are required' });
      return;
    }

    const db = getDB();
    processLessonExpirations(db);

    const nowTime = new Date();
    const todayFormatted = nowTime.toISOString().split('T')[0];
    const targetDate = lessonDate || todayFormatted;

    const course = db.courses.find(c => c.courseId === courseId);
    const targetSubject = (subject || (course ? course.category : 'General')).trim();
    const targetTopic = (topic || title).trim();

    // Prevent duplicate videos for the same Course + Subject + Date
    const duplicate = (db.lessons || []).find((l: any) => {
      const lSubject = (l.subject || '').trim().toLowerCase();
      const lDate = l.lessonDate || (l.uploadedAt ? l.uploadedAt.split('T')[0] : '');
      return l.courseId === courseId && 
             lSubject === targetSubject.toLowerCase() && 
             lDate === targetDate;
    });

    if (duplicate) {
      res.status(400).json({ 
        message: `A video lesson already exists for Subject "${targetSubject}" on Date ${targetDate} for this course. Only one video per subject per day is allowed.` 
      });
      return;
    }

    const expiresTime = new Date(nowTime.getTime() + TWELVE_HOURS_MS);

    const newLesson: Lesson = {
      lessonId: 'les-' + Date.now(),
      courseId,
      title,
      subject: targetSubject,
      topic: targetTopic,
      lessonDate: targetDate,
      videoUrl,
      pdfUrl: pdfUrl || '#',
      uploadedAt: nowTime.toISOString(),
      expiresAt: expiresTime.toISOString(),
      isExpired: false
    };

    if (!db.lessons) db.lessons = [];
    db.lessons.push(newLesson);
    saveDB(db);
    res.status(201).json(newLesson);
  });

  app.put('/api/lessons/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, subject, topic, lessonDate, videoUrl, pdfUrl } = req.body;
    const db = getDB();

    const lesson = db.lessons.find(l => l.lessonId === id);
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    if (title) lesson.title = title;
    if (subject) lesson.subject = subject;
    if (topic) lesson.topic = topic;
    if (lessonDate) lesson.lessonDate = lessonDate;
    if (videoUrl) {
      lesson.videoUrl = videoUrl;
      const nowTime = new Date();
      lesson.uploadedAt = nowTime.toISOString();
      lesson.expiresAt = new Date(nowTime.getTime() + TWELVE_HOURS_MS).toISOString();
      lesson.isExpired = false;
    }
    if (pdfUrl) lesson.pdfUrl = pdfUrl;

    saveDB(db);
    res.json(lesson);
  });

  app.delete('/api/lessons/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = getDB();

    db.lessons = db.lessons.filter(l => l.lessonId !== id);
    saveDB(db);
    res.json({ message: 'Lesson deleted successfully' });
  });

  // REST API: Quizzes & Questions
  app.get('/api/quizzes', (req, res) => {
    res.json(getDB().quizzes || []);
  });

  app.get('/api/courses/:id/quizzes', (req, res) => {
    const { id } = req.params;
    const quizList = getDB().quizzes.filter(q => q.courseId === id);
    res.json(quizList);
  });

  app.post('/api/quizzes', authenticateToken, (req, res) => {
    const { courseId, title, questions } = req.body;
    if (!courseId || !title || !questions || !Array.isArray(questions)) {
      res.status(400).json({ message: 'Course ID, Quiz Title, and Questions array are required' });
      return;
    }

    const db = getDB();
    const newQuizId = 'q-' + Date.now();
    const newQuiz: Quiz = { quizId: newQuizId, courseId, title };
    
    db.quizzes.push(newQuiz);

    questions.forEach((q: any) => {
      const newQuestion: Question = {
        questionId: 'qst-' + Math.random().toString(36).substr(2, 9),
        quizId: newQuizId,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        answer: q.answer
      };
      db.questions.push(newQuestion);
    });

    saveDB(db);
    res.status(201).json(newQuiz);
  });

  app.delete('/api/quizzes/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = getDB();

    db.quizzes = db.quizzes.filter(q => q.quizId !== id);
    db.questions = db.questions.filter(q => q.quizId !== id);
    db.results = db.results.filter(r => r.quizId !== id);

    saveDB(db);
    res.json({ message: 'Quiz deleted successfully' });
  });

  app.get('/api/quizzes/:id/questions', authenticateToken, (req, res) => {
    const { id } = req.params;
    const questionList = getDB().questions.filter(q => q.quizId === id);
    res.json(questionList);
  });

  app.post('/api/quizzes/submit', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const { quizId, answers } = req.body; // answers is an object mapping questionId to choice ('A', 'B', etc.)

    const db = getDB();
    const student = db.students.find(s => s.userId === user.id);
    const studentId = student ? student.studentId : 'std-unknown';
    const studentName = user.name;

    const quiz = db.quizzes.find(q => q.quizId === quizId);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    const questionsList = db.questions.filter(q => q.quizId === quizId);
    let correctCount = 0;

    questionsList.forEach(q => {
      const userAnswer = answers[q.questionId];
      if (userAnswer === q.answer) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / questionsList.length) * 100) || 0;
    const pass = percentage >= 50;

    const newResult: Result = {
      resultId: 'res-' + Date.now(),
      studentId,
      studentName,
      quizId,
      quizTitle: quiz.title,
      score: correctCount,
      totalQuestions: questionsList.length,
      percentage,
      pass,
      date: new Date().toISOString()
    };

    db.results.push(newResult);
    saveDB(db);
    res.status(201).json(newResult);
  });

  // REST API: Results
  app.get('/api/results', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const db = getDB();

    if (user.role === 'STUDENT') {
      const std = db.students.find(s => s.userId === user.id);
      if (std) {
        return res.json(db.results.filter(r => r.studentId === std.studentId));
      }
      return res.json([]);
    }

    // Teacher or Admin sees all results
    res.json(db.results);
  });

  // REST API: Announcements
  app.get('/api/announcements', (req, res) => {
    res.json(getDB().announcements);
  });

  app.post('/api/announcements', authenticateToken, (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
      res.status(400).json({ message: 'Title and description are required' });
      return;
    }

    const db = getDB();
    const newAnn: Announcement = {
      announcementId: 'ann-' + Date.now(),
      title,
      description,
      date: new Date().toISOString()
    };

    db.announcements.push(newAnn);
    saveDB(db);
    res.status(201).json(newAnn);
  });

  app.delete('/api/announcements/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = getDB();

    db.announcements = db.announcements.filter(a => a.announcementId !== id);
    saveDB(db);
    res.json({ message: 'Announcement deleted successfully' });
  });

  // REST API: Enrollments
  // Helper function to resolve or create a student profile for enrollment
  const getOrCreateStudent = (user: any, db: any): Student => {
    if (!db.students) db.students = [];
    let std = db.students.find(s => s.userId === user.id);
    if (!std) {
      std = {
        studentId: `std-${user.id}`,
        userId: user.id,
        name: user.name || 'Student',
        grade: 'Standard 10'
      };
      db.students.push(std);
      saveDB(db);
    }
    return std;
  };

  app.get('/api/enrollments', authenticateToken, (req, res) => {
    const db = getDB();
    res.json(db.enrollments || []);
  });

  app.get('/api/courses/enrolled', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const db = getDB();
    const std = getOrCreateStudent(user, db);
    const enrolls = (db.enrollments || [])
      .filter(e => e.userId === user.id || e.studentId === std.studentId || e.studentId === user.id)
      .map(e => e.courseId);
    res.json(Array.from(new Set(enrolls)));
  });

  app.post('/api/courses/enroll-multiple', authenticateToken, (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      res.status(400).json({ message: 'Invalid payload: ids must be an array' });
      return;
    }
    const user = (req as any).user;
    const db = getDB();
    const std = getOrCreateStudent(user, db);

    let enrolledCount = 0;
    const now = Date.now();
    if (!db.enrollments) db.enrollments = [];
    ids.forEach((id, index) => {
      const alreadyEnrolled = db.enrollments.some(
        e => (e.userId === user.id || e.studentId === std.studentId || e.studentId === user.id) && e.courseId === id
      );
      if (!alreadyEnrolled) {
        const newEnroll: Enrollment = {
          enrollmentId: `enr-${now}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          studentId: std.studentId,
          userId: user.id,
          courseId: id,
          date: new Date().toISOString()
        };
        db.enrollments.push(newEnroll);
        enrolledCount++;
      }
    });

    if (enrolledCount > 0) {
      saveDB(db);
    }

    res.json({ message: `Successfully enrolled in ${enrolledCount} subjects and courses`, enrolledCount });
  });

  app.post('/api/courses/:id/enroll', authenticateToken, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const db = getDB();
    const std = getOrCreateStudent(user, db);

    const alreadyEnrolled = (db.enrollments || []).some(
      e => (e.userId === user.id || e.studentId === std.studentId || e.studentId === user.id) && e.courseId === id
    );
    if (alreadyEnrolled) {
      res.status(400).json({ message: 'Already enrolled in this course or textbook' });
      return;
    }

    const { transactionId, verificationDetails } = req.body;
    const targetCourse = (db.courses || []).find(c => c.courseId === id);
    
    if (targetCourse?.isPaid && !transactionId) {
      res.status(400).json({ message: 'Payment verification details are required for premium courses' });
      return;
    }

    const newEnroll: Enrollment = {
      enrollmentId: 'enr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId: std.studentId,
      userId: user.id,
      courseId: id,
      date: new Date().toISOString(),
      transactionId: transactionId || undefined,
      verificationDetails: verificationDetails || undefined
    };

    if (!db.enrollments) db.enrollments = [];
    db.enrollments.push(newEnroll);
    saveDB(db);

    res.json({ message: 'Enrolled successfully', enrollment: newEnroll });
  });

  app.delete('/api/courses/:id/enroll', authenticateToken, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const db = getDB();
    const std = getOrCreateStudent(user, db);

    if (db.enrollments) {
      db.enrollments = db.enrollments.filter(
        e => !((e.userId === user.id || e.studentId === std.studentId || e.studentId === user.id) && e.courseId === id)
      );
      saveDB(db);
    }
    res.json({ message: 'Unenrolled successfully' });
  });

  app.post('/api/courses/:id/unenroll', authenticateToken, (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const db = getDB();
    const std = getOrCreateStudent(user, db);

    if (db.enrollments) {
      db.enrollments = db.enrollments.filter(
        e => !((e.userId === user.id || e.studentId === std.studentId || e.studentId === user.id) && e.courseId === id)
      );
      saveDB(db);
    }
    res.json({ message: 'Unenrolled successfully' });
  });

  // REST API: Resources (Centralized Resource Library)
  app.get('/api/resources', (req, res) => {
    res.json(getDB().resources || []);
  });

  app.get('/api/resources/:id/download', (req, res) => {
    const { id } = req.params;
    const db = getDB();
    const resource = (db.resources || []).find(r => r.resourceId === id);
    if (!resource) {
      res.status(404).send('Resource study guide not found');
      return;
    }

    const courseName = db.courses.find(c => c.courseId === resource.courseId)?.title || 'General Course';
    
    // Generate a rich, study-ready learning material file content
    const fileContent = `========================================================================
DIGI LEARNING PROJECT
CENTRALIZED RESOURCE LIBRARY STUDY MATERIAL
========================================================================
Resource Name   : ${resource.title}
Material Type   : ${resource.type}
Linked Course   : ${courseName}
Uploaded By     : ${resource.addedBy}
Release Date    : ${new Date(resource.date).toLocaleDateString()}
Resource Size   : ${resource.fileSize}
========================================================================

1. RESOURCE OVERVIEW
--------------------
${resource.description}

2. STUDY COMPANION SUMMARY & LESSON NOTES
-----------------------------------------
This reading guide is part of the digital supplemental library curated
by the Digi Learning academic team. Use these notes as a bridge between
the digital video sessions and your formal homework worksheets.

Key Focal Areas:
* Primary Concepts: Ensure you understand the underlying axioms and vocabulary definitions.
* Practical Applications: Make note of daily-life connections described in the materials.
* Self-Reflection: Ask yourself how this chapter's lessons help you in your community.

3. KNOWLEDGE CHECK & ACTIVITY SECTION
-------------------------------------
Attempt the following practice exercises to cement your comprehension:

[Activity 1 - Concept Mapping]
Draw a quick conceptual map linking 3 main topics discussed in this ${resource.type}.
Share this with your peer study circle.

[Activity 2 - Practical Exercise]
Write a 1-paragraph summary describing how this topic manifests in your immediate environment.

[Activity 3 - Diagnostic Query]
Create 3 potential quiz questions based on these guidelines and quiz your classmates!

========================================================================
Digi Learning - Quality Digital Education for Every Village School
========================================================================`;

    // Trigger standard file download in browser
    const safeFilename = resource.title.replace(/[^a-zA-Z0-9]/g, '_');
    res.setHeader('Content-disposition', `attachment; filename="${safeFilename}_StudyGuide.txt"`);
    res.setHeader('Content-type', 'text/plain; charset=utf-8');
    res.send(fileContent);
  });

  app.post('/api/resources', authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only teachers and admins can upload resources' });
      return;
    }

    const { courseId, title, description, type, fileSize } = req.body;
    if (!courseId || !title || !description || !type) {
      res.status(400).json({ message: 'Course ID, Title, Description, and Type are required' });
      return;
    }

    const db = getDB();
    if (!db.resources) db.resources = [];

    const newResourceId = 'res-' + Date.now();
    const newResource: Resource = {
      resourceId: newResourceId,
      courseId,
      title,
      description,
      type,
      fileSize: fileSize || '1.5 MB',
      downloadUrl: `/api/resources/${newResourceId}/download`,
      addedBy: user.name,
      date: new Date().toISOString()
    };

    db.resources.push(newResource);
    saveDB(db);
    res.status(201).json(newResource);
  });

  app.put('/api/resources/:id', authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only teachers and admins can modify resources' });
      return;
    }

    const { id } = req.params;
    const { title, description, type, courseId, fileSize } = req.body;
    const db = getDB();

    if (!db.resources) db.resources = [];
    const resource = db.resources.find(r => r.resourceId === id);
    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }

    if (title) resource.title = title;
    if (description) resource.description = description;
    if (type) resource.type = type;
    if (courseId) resource.courseId = courseId;
    if (fileSize) resource.fileSize = fileSize;

    saveDB(db);
    res.json(resource);
  });

  app.delete('/api/resources/:id', authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only teachers and admins can delete resources' });
      return;
    }

    const { id } = req.params;
    const db = getDB();

    if (!db.resources) db.resources = [];
    db.resources = db.resources.filter(r => r.resourceId !== id);
    saveDB(db);
    res.json({ message: 'Resource deleted successfully' });
  });

  // ==========================================
  // REST API: Assignments & Submissions
  // ==========================================

  // Get all assignments
  app.get('/api/assignments', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const db = getDB();

    let responseAssignments = db.assignments.map(asg => {
      const course = db.courses.find(c => c.courseId === asg.courseId);
      return {
        ...asg,
        courseTitle: course ? course.title : asg.courseTitle
      };
    });

    if (user.role === 'TEACHER') {
      const tch = db.teachers.find(t => t.userId === user.id);
      if (tch) {
        const teacherCourses = db.courses.filter(c => c.teacherId === tch.teacherId).map(c => c.courseId);
        responseAssignments = responseAssignments.filter(asg => 
          asg.addedByTeacherId === tch.teacherId || teacherCourses.includes(asg.courseId)
        );
      }
    } else if (user.role === 'STUDENT') {
      const std = db.students.find(s => s.userId === user.id);
      if (std) {
        const enrolledCourseIds = db.enrollments
          .filter(e => e.studentId === std.studentId)
          .map(e => e.courseId);
        
        responseAssignments = responseAssignments.filter(asg => enrolledCourseIds.includes(asg.courseId));
      }
    }

    res.json(responseAssignments);
  });

  // Get single assignment details
  app.get('/api/assignments/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = getDB();
    const assignment = db.assignments.find(a => a.assignmentId === id);
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' });
      return;
    }
    const course = db.courses.find(c => c.courseId === assignment.courseId);
    res.json({
      ...assignment,
      courseTitle: course ? course.title : assignment.courseTitle
    });
  });

  // Create a new assignment (Teacher or Admin)
  app.post('/api/assignments', authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only teachers and admins can create assignments' });
      return;
    }

    const { courseId, title, description, dueDate, maxPoints } = req.body;
    if (!courseId || !title || !description || !dueDate || !maxPoints) {
      res.status(400).json({ message: 'Course ID, Title, Description, Due Date, and Max Points are required' });
      return;
    }

    const db = getDB();
    const course = db.courses.find(c => c.courseId === courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const teacherId = user.role === 'TEACHER' 
      ? (db.teachers.find(t => t.userId === user.id)?.teacherId || 'tch-unknown')
      : 'admin';

    const newAssignment: Assignment = {
      assignmentId: 'asg-' + Date.now(),
      courseId,
      courseTitle: course.title,
      title,
      description,
      dueDate,
      maxPoints: Number(maxPoints),
      addedByTeacherId: teacherId,
      addedByTeacherName: user.name,
      date: new Date().toISOString()
    };

    db.assignments.push(newAssignment);
    saveDB(db);
    res.status(201).json(newAssignment);
  });

  // Delete assignment
  app.delete('/api/assignments/:id', authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only teachers and admins can delete assignments' });
      return;
    }

    const { id } = req.params;
    const db = getDB();
    db.assignments = db.assignments.filter(a => a.assignmentId !== id);
    db.submissions = db.submissions.filter(s => s.assignmentId !== id);
    saveDB(db);
    res.json({ message: 'Assignment and associated submissions deleted successfully' });
  });

  // Get submissions
  app.get('/api/submissions', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const db = getDB();

    let responseSubmissions = db.submissions.map(sub => {
      const asg = db.assignments.find(a => a.assignmentId === sub.assignmentId);
      const course = db.courses.find(c => c.courseId === sub.courseId);
      return {
        ...sub,
        assignmentTitle: asg ? asg.title : sub.assignmentTitle,
        courseTitle: course ? course.title : sub.courseTitle
      };
    });

    if (user.role === 'STUDENT') {
      const std = db.students.find(s => s.userId === user.id);
      if (std) {
        responseSubmissions = responseSubmissions.filter(s => s.studentId === std.studentId);
      } else {
        responseSubmissions = [];
      }
    } else if (user.role === 'TEACHER') {
      const tch = db.teachers.find(t => t.userId === user.id);
      if (tch) {
        const teacherCourses = db.courses.filter(c => c.teacherId === tch.teacherId).map(c => c.courseId);
        responseSubmissions = responseSubmissions.filter(s => 
          teacherCourses.includes(s.courseId) || 
          db.assignments.find(a => a.assignmentId === s.assignmentId)?.addedByTeacherId === tch.teacherId
        );
      }
    }

    res.json(responseSubmissions);
  });

  // Submit an assignment (Student only)
  app.post('/api/submissions', authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'STUDENT') {
      res.status(403).json({ message: 'Only students can submit assignments' });
      return;
    }

    const { assignmentId, submittedContent, submittedFileUrl } = req.body;
    if (!assignmentId || !submittedContent) {
      res.status(400).json({ message: 'Assignment ID and Submitted Content are required' });
      return;
    }

    const db = getDB();
    const assignment = db.assignments.find(a => a.assignmentId === assignmentId);
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' });
      return;
    }

    const std = db.students.find(s => s.userId === user.id);
    if (!std) {
      res.status(404).json({ message: 'Student profile not found' });
      return;
    }

    const existingIndex = db.submissions.findIndex(s => s.assignmentId === assignmentId && s.studentId === std.studentId);
    
    const newSubmission: AssignmentSubmission = {
      submissionId: existingIndex !== -1 ? db.submissions[existingIndex].submissionId : 'sub-' + Date.now(),
      assignmentId,
      assignmentTitle: assignment.title,
      studentId: std.studentId,
      studentName: user.name,
      courseId: assignment.courseId,
      courseTitle: assignment.courseTitle,
      submittedContent,
      submittedFileUrl: submittedFileUrl || '',
      submittedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    if (existingIndex !== -1) {
      db.submissions[existingIndex] = newSubmission;
    } else {
      db.submissions.push(newSubmission);
    }

    saveDB(db);
    res.status(201).json(newSubmission);
  });

  // Grade/review a submission (Teacher or Admin)
  app.put('/api/submissions/:id/grade', authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only teachers and admins can grade submissions' });
      return;
    }

    const { id } = req.params;
    const { grade, feedback, status } = req.body;
    if (!grade) {
      res.status(400).json({ message: 'Grade is required' });
      return;
    }

    const db = getDB();
    const submission = db.submissions.find(s => s.submissionId === id);
    if (!submission) {
      res.status(404).json({ message: 'Submission not found' });
      return;
    }

    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.status = status || 'GRADED';
    submission.gradedBy = user.name;
    submission.gradedAt = new Date().toISOString();

    saveDB(db);
    res.json(submission);
  });

  // Bookmarks APIs
  app.get('/api/bookmarks', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const db = getDB();
    const userBookmarks = (db.bookmarks || []).filter(b => b.userId === user.id);
    res.json(userBookmarks);
  });

  app.post('/api/bookmarks/toggle', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const { type, itemId, title, courseId, courseTitle, thumbnail } = req.body;

    if (!type || !itemId || !title) {
      res.status(400).json({ message: 'Type, itemId, and title are required' });
      return;
    }

    const db = getDB();
    if (!db.bookmarks) db.bookmarks = [];

    const index = db.bookmarks.findIndex(b => b.userId === user.id && b.type === type && b.itemId === itemId);
    
    if (index !== -1) {
      // Remove bookmark
      db.bookmarks.splice(index, 1);
      saveDB(db);
      res.json({ message: 'Bookmark removed successfully', bookmarked: false });
    } else {
      // Add bookmark
      const newBookmark: Bookmark = {
        bookmarkId: 'bmk-' + Date.now(),
        userId: user.id,
        type,
        itemId,
        title,
        courseId,
        courseTitle,
        thumbnail,
        date: new Date().toISOString()
      };
      db.bookmarks.push(newBookmark);
      saveDB(db);
      res.status(201).json({ message: 'Bookmark added successfully', bookmark: newBookmark, bookmarked: true });
    }
  });

  app.delete('/api/bookmarks/:id', authenticateToken, (req, res) => {
    const user = (req as any).user;
    const { id } = req.params;

    const db = getDB();
    if (!db.bookmarks) db.bookmarks = [];

    const index = db.bookmarks.findIndex(b => b.bookmarkId === id && b.userId === user.id);
    if (index === -1) {
      res.status(404).json({ message: 'Bookmark not found' });
      return;
    }

    db.bookmarks.splice(index, 1);
    saveDB(db);
    res.json({ message: 'Bookmark deleted successfully' });
  });

  // AI Classroom Doubts Assistant / Chatbot
  app.post('/api/ai/doubts', async (req, res) => {
    const { messages, courseContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ message: 'Conversation messages are required and must be an array.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({ 
        message: 'The AI Doubts Assistant is currently offline because the API key is not configured. Please add the GEMINI_API_KEY secret in Settings > Secrets.' 
      });
      return;
    }

    try {
      // Lazy initialization of GoogleGenAI
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let systemInstruction = "You are a dedicated AI Classroom Doubts Assistant. " +
        "Your goal is to explain educational concepts to students clearly, concisely, and patiently. " +
        "Use step-by-step explanations, clear formatting with markdown, and appropriate academic examples. " +
        "Help the student grasp the underlying theory and solve their doubts. Encourage logical thinking.";

      if (courseContext) {
        systemInstruction += `\n\nCurrently, the student is studying the course: "${courseContext.title}" (Subject: ${courseContext.subject || 'General'}).`;
        if (courseContext.description) {
          systemInstruction += `\nCourse details: ${courseContext.description}`;
        }
        if (courseContext.currentChapter) {
          systemInstruction += `\nThe student is currently stuck or asking about: "${courseContext.currentChapter}"`;
        }
      }

      // Format messages into Gemini API parts
      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      // Generate content using gemini-3.5-flash
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const text = response.text || "I'm sorry, I couldn't generate a response. Could you please rephrase your doubt?";
      res.json({ text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ 
        message: 'An error occurred while communicating with the AI. Please try again later.',
        error: error.message 
      });
    }
  });

  // Database Backup/Download Routes
  app.get('/database.json', (req, res) => {
    try {
      const db = getDB();
      res.setHeader('Content-disposition', 'attachment; filename="database.json"');
      res.setHeader('Content-type', 'application/json; charset=utf-8');
      res.send(JSON.stringify(db, null, 2));
    } catch (err: any) {
      console.error("Failed to serve direct database.json download:", err);
      res.status(500).send("Failed to read database.json: " + err.message);
    }
  });

  app.get('/api/database.json', (req, res) => {
    try {
      const db = getDB();
      res.setHeader('Content-disposition', 'attachment; filename="database.json"');
      res.setHeader('Content-type', 'application/json; charset=utf-8');
      res.send(JSON.stringify(db, null, 2));
    } catch (err: any) {
      console.error("Failed to serve database.json download:", err);
      res.status(500).send("Failed to read database.json: " + err.message);
    }
  });

  app.get('/api/admin/database/download', (req, res) => {
    try {
      const db = getDB();
      res.setHeader('Content-disposition', 'attachment; filename="database.json"');
      res.setHeader('Content-type', 'application/json; charset=utf-8');
      res.send(JSON.stringify(db, null, 2));
    } catch (err: any) {
      console.error("Failed to serve admin database backup download:", err);
      res.status(500).send("Failed to download database backup: " + err.message);
    }
  });

  // Serve Service Worker with proper headers for offline support
  app.get('/sw.js', (req, res) => {
    const swPublicPath = path.join(process.cwd(), 'public', 'sw.js');
    const swDistPath = path.join(process.cwd(), 'dist', 'sw.js');
    const targetPath = fs.existsSync(swPublicPath) ? swPublicPath : swDistPath;

    if (fs.existsSync(targetPath)) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(targetPath);
    } else {
      res.status(404).send('Service worker file not found');
    }
  });

  // Serve static files / Vite Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode\n  ➜ Local:   http://localhost:${PORT}/\n  ➜ Network: http://127.0.0.1:${PORT}/\n`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
