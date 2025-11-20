import * as institutionService from '../services/institutionsService.js';

export const signupInstitutionAdmin = async (req, res) => {
  try {
    const admin = await institutionService.signupInstitutionAdmin(req.body);
    res.status(201).json(admin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginInstitutionAdmin = async (req, res) => {
  try {
    const { institution_id, username, password } = req.body;
    const result = await institutionService.loginInstitutionAdmin(institution_id, username, password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const deleteInstitutionAdmin = async (req, res) => {
  const { institution_id, username } = req.params;
  try {
    const message = await institutionService.deleteInstitutionAdmin(institution_id, username);
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const modifyInstitutionPassword = async (req, res) => {
  const { institution_id, username, oldPassword, newPassword } = req.body;
  try {
    const result = await institutionService.modifyInstitutionPassword(institution_id, username, oldPassword, newPassword);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getInstitutionAdminsByInstitution = async (req, res) => {
  try {
    const admins = await institutionService.getInstitutionAdminsByInstitution(req.params.institution_id);
    res.json(admins);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
