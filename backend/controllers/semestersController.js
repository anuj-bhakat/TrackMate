import * as semesterService from '../services/semestersService.js';

// Create semester
export const createSemester = async (req, res) => {
  try {
    const semester = await semesterService.createSemester(req.body);
    res.status(201).json(semester);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get semesters by institution_id
export const getSemestersByInstitution = async (req, res) => {
  try {
    const { institution_id } = req.params;
    const semesters = await semesterService.getSemestersByInstitution(institution_id);
    res.json(semesters);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get semesters by institution_id and program_code
export const getSemestersByInstitutionAndProgram = async (req, res) => {
  try {
    const { institution_id, program_code } = req.params;
    const semesters = await semesterService.getSemestersByInstitutionAndProgram(institution_id, program_code);
    res.json(semesters);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update semester (by institution_id, program_code, semester_code)
export const updateSemester = async (req, res) => {
  try {
    const { institution_id, program_code, semester_code } = req.params;
    const updates = req.body;
    const semester = await semesterService.updateSemester(institution_id, program_code, semester_code, updates);
    res.json(semester);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete semester (by institution_id, program_code, semester_code)
export const deleteSemester = async (req, res) => {
  try {
    const { institution_id, program_code, semester_code } = req.params;
    const result = await semesterService.deleteSemester(institution_id, program_code, semester_code);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
