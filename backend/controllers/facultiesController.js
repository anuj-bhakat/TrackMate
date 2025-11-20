import * as facultyService from '../services/facultiesService.js';

export const signupFaculty = async (req, res) => {
  try {
    const faculty = await facultyService.signupFaculty(req.body);
    res.status(201).json(faculty);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginFaculty = async (req, res) => {
  try {
    const { institution_id, username, password } = req.body;
    const result = await facultyService.loginFaculty(institution_id, username, password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteFaculty = async (req, res) => {
  const { institution_id, faculty_id } = req.params;
  try {
    const message = await facultyService.deleteFaculty(institution_id, faculty_id);
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const modifyFacultyPassword = async (req, res) => {
  const { institution_id, username, oldPassword, newPassword } = req.body;
  try {
    const result = await facultyService.modifyFacultyPassword(institution_id, username, oldPassword, newPassword);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getFacultiesByInstitution = async (req, res) => {
  try {
    const faculties = await facultyService.getFacultiesByInstitution(req.params.institution_id);
    res.json(faculties);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
