import * as programService from '../services/programsService.js';

export const createProgram = async (req, res) => {
  try {
    const program = await programService.createProgram(req.body);
    res.status(201).json(program);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPrograms = async (req, res) => {
  try {
    const institution_id = req.params.institution_id;
    if (!institution_id) {
      return res.status(400).json({ error: 'institution_id is required' });
    }
    const programs = await programService.getPrograms(institution_id);
    res.json(programs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getProgramByCode = async (req, res) => {
  try {
    const { institution_id, program_code } = req.params;
    const program = await programService.getProgramByCode(institution_id, program_code);
    res.json(program);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProgram = async (req, res) => {
  try {
    const { institution_id, program_code } = req.params;
    const program = await programService.updateProgram(institution_id, program_code, req.body);
    res.json(program);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProgram = async (req, res) => {
  try {
    const { institution_id, program_code } = req.params;
    const result = await programService.deleteProgram(institution_id, program_code);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getStudentsByProgramId = async (req, res) => {
  try {
    const students = await programService.getStudentsByProgramId(req.params.program_id);
    res.json(students);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};