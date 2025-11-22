import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import all your route modules:
import availableInstitutionsRoutes from './routes/availableInstitutions.js';
import studentsRoutes from './routes/students.js';
import facultiesRoutes from './routes/faculties.js';
import institutionsRoutes from './routes/institutions.js';
import programsRoutes from './routes/programs.js';
import semestersRoutes from './routes/semesters.js';
import coursesRoutes from './routes/courses.js';
import studentDetailsRoutes from './routes/studentDetails.js';
import groupsRoutes from './routes/groups.js';
import groupDetailsRoutes from './routes/groupDetails.js';
import assignmentsRoutes from './routes/assignments.js';
import assignmentSubmissionsRoutes from './routes/assignmentSubmissions.js';
import groupAnalyticsRoutes from './routes/groupAnalytics.js';
import studentGroupAnalyticsRoutes from './routes/studentGroupAnalytics.js';
import programSemestersRoutes from './routes/programSemesters.js';
import semesterCoursesRoutes from './routes/semesterCourses.js';
import courseStudentsMarksRoutes from './routes/courseStudentsMarks.js';
import semesterGradesRoutes from './routes/semesterGrades.js';
import courseGradesRoutes from './routes/courseGrades.js';
import programGradesRoutes from './routes/programGrades.js';
import similarityRoutes from "./routes/similarityRoutes.js";


dotenv.config();

const app = express();
app.use(cors({
  origin: '*'
}));
app.use(express.json());

// Mount all your entity routes:
app.use('/api/available-institutions', availableInstitutionsRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/faculties', facultiesRoutes);
app.use('/api/institutions', institutionsRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/semesters', semestersRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/student-details', studentDetailsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/group-details', groupDetailsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/assignment-submissions', assignmentSubmissionsRoutes);

app.use('/api/group-analytics', groupAnalyticsRoutes);
app.use('/api/student-group-analytics', studentGroupAnalyticsRoutes);
app.use('/api/program-semesters', programSemestersRoutes);
app.use('/api/semester-courses', semesterCoursesRoutes);
app.use('/api/course-students-marks', courseStudentsMarksRoutes);

app.use('/api/semester-grades', semesterGradesRoutes);
app.use('/api/course-grades', courseGradesRoutes);
app.use('/api/program-grades', programGradesRoutes);

app.use("/check-similarity", similarityRoutes);





const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
