# TrackMate

TrackMate is a specialized Performance Tracking and Analytics Platform designed to monitor and analyze academic progress. It leverages data from assignments, exams, and assessments to provide deep insights into student performance over time.

## Features

### 🏛️ For Institutions
*   **Academic Structure Management**: Define and manage Programs, Semesters, and Courses.
*   **User Management**: Onboard and manage Faculties and Students.
*   **Overview**: Get a high-level view of institutional performance.

### 👩‍🏫 For Faculty
*   **Course Management**: Manage assigned courses and groups.
*   **Assignment Creation**: Create detailed assignments with attachments.
*   **Grading & Feedback**: Review submissions, provide feedback, and assign marks.
*   **Integrity Checks**: Automated similarity checking for student submissions.
*   **Analytics**: View detailed performance analytics for groups and individual students.

### 🎓 For Students
*   **Dashboard**: Centralized view of enrolled courses and pending tasks.
*   **Assignment Submission**: Submit assignments (text or files) before deadlines.
*   **Progress Tracking**: View grades, feedback, and personal performance analytics.
*   **Resource Access**: Access course materials and assignment attachments.

## Tech Stack

### Frontend
*   **Framework**: React (with Vite)
*   **Styling**: TailwindCSS
*   **HTTP Client**: Axios
*   **Utilities**: `html2canvas`, `jspdf`, `xlsx` for reporting and data export.

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: Supabase
*   **Authentication**: JWT (JSON Web Tokens) & Bcrypt
*   **Storage**: Cloudinary (for file uploads)
*   **Middleware**: CORS, Dotenv, Multer

## Project Structure

The project is divided into two main directories:

*   **`frontend/`**: Contains the React application (Vite).
*   **`backend/`**: Contains the Node.js/Express API server.


