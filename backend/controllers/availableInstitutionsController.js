import * as institutionService from '../services/availableInstitutionsService.js';

export const createInstitution = async (req, res) => {
  const { institution_name, institution_id } = req.body;
  try {
    const data = await institutionService.createInstitution(institution_name, institution_id);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getInstitutions = async (req, res) => {
  try {
    const data = await institutionService.getAllInstitutions();
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getInstitutionById = async (req, res) => {
  const { institution_id } = req.params;
  try {
    const data = await institutionService.getInstitutionById(institution_id);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const updateInstitution = async (req, res) => {
  const { institution_id } = req.params;
  const { institution_name } = req.body;
  try {
    const data = await institutionService.updateInstitution(institution_id, institution_name);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteInstitution = async (req, res) => {
  const { institution_id } = req.params;
  try {
    const message = await institutionService.deleteInstitution(institution_id);
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
