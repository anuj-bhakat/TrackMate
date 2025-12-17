import * as studentService from '../services/studentsService.js';

export const signupStudent = async (req, res) => {
  try {
    const student = await studentService.signupStudent(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { institution_id, username, password, isGuest } = req.body;
    const result = await studentService.loginStudent(institution_id, username, password, isGuest);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const deleteStudent = async (req, res) => {
  const { institution_id, student_id } = req.params;
  try {
    const message = await studentService.deleteStudent(institution_id, student_id);
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const modifyStudentPassword = async (req, res) => {
  const { institution_id, username, oldPassword, newPassword } = req.body;
  try {
    const result = await studentService.modifyStudentPassword(institution_id, username, oldPassword, newPassword);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getStudentsByInstitution = async (req, res) => {
  try {
    const students = await studentService.getStudentsByInstitution(req.params.institution_id);
    res.json(students);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
