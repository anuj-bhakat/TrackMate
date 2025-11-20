import * as service from '../services/programGradesService.js';

export const upsert = async (req, res) => {
  try {
    const { student_id, program_id } = req.body;
    const data = await service.computeAndUpsertProgramGrade(student_id, program_id);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await service.updateProgramGrade(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const get = async (req, res) => {
  try {
    const data = await service.getProgramGrade(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const data = await service.deleteProgramGrade(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllByProgram = async (req, res) => {
  try {
    const data = await service.getGradesByProgramId(req.params.program_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllByStudent = async (req, res) => {
  try {
    const data = await service.getGradesByStudentId(req.params.student_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
