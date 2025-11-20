import * as programSemestersService from '../services/programSemestersService.js';

export const createProgramSemester = async (req, res) => {
  try {
    const result = await programSemestersService.createProgramSemester(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProgramSemester = async (req, res) => {
  try {
    const result = await programSemestersService.updateProgramSemester(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProgramSemester = async (req, res) => {
  try {
    const result = await programSemestersService.deleteProgramSemester(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getProgramSemestersByProgramId = async (req, res) => {
  try {
    const result = await programSemestersService.getProgramSemestersByProgramId(req.params.programs_refer_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
