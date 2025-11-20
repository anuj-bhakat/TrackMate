import * as courseService from '../services/coursesService.js';

// Create
export const createCourse = async (req, res) => {
  try {
    const course = await courseService.createCourse(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all for program/semester (and institution)
export const getCoursesByProgramAndSemester = async (req, res) => {
  try {
    const { institution_id, program_code, semester_code } = req.params;
    const courses = await courseService.getCoursesByProgramAndSemester(institution_id, program_code, semester_code);
    res.json(courses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update course (by id)
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await courseService.updateCourse(id, req.body);
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete course (by id)
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await courseService.deleteCourse(id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Assign faculty (by id)
export const assignFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_id } = req.body;
    const course = await courseService.assignFaculty(id, faculty_id);
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all courses for a faculty
export const getCoursesByFacultyId = async (req, res) => {
  const { faculty_id } = req.params;
  if (!faculty_id) {
    return res.status(400).json({ error: 'faculty_id param is required' });
  }
  try {
    const courses = await courseService.getCoursesByFacultyId(faculty_id);
    res.json(courses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getCoursesByInstitutionId = async (req, res) => {
  const { institution_id } = req.params;
  if (!institution_id) {
    return res.status(400).json({ error: 'institution_id param is required' });
  }
  try {
    const courses = await courseService.getCoursesByInstitutionId(institution_id);
    res.json(courses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};