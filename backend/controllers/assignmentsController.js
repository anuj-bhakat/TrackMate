import * as assignmentsService from '../services/assignmentsService.js';
import cloudinary from '../config/cloudinary.js';

export const createAssignment = async (req, res) => {
  try {
    const { group_refer_id, assignment_name, assignment_desc, assigned_on, due, marks } = req.body;
    let attachments = {};

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'assignments',
              public_id: file.originalname,
              overwrite: true,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve({ fileName: file.originalname, url: result.secure_url });
            }
          ).end(file.buffer);
        });
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      uploadedFiles.forEach(({ fileName, url }) => {
        attachments[fileName] = url;
      });
    }

    const assignment = await assignmentsService.createAssignment({
      group_refer_id,
      assignment_name,
      assignment_desc,
      attachments,
      assigned_on,
      due,
      marks: marks ? parseFloat(marks) : null // convert marks to number
    });

    res.status(201).json(assignment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    const updates = { ...req.body };
    if ('marks' in updates) updates.marks = updates.marks ? parseFloat(updates.marks) : null;
    const assignment = await assignmentsService.updateAssignment(id, updates);
    res.json(assignment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await assignmentsService.deleteAssignment(id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAssignmentsByGroupId = async (req, res) => {
  const { group_refer_id } = req.params;
  try {
    const assignments = await assignmentsService.getAssignmentsByGroupId(group_refer_id);
    res.json(assignments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAssignmentsByCourseId = async (req, res) => {
  const { course_id } = req.params;
  try {
    const assignments = await assignmentsService.getAssignmentsByCourseId(course_id);
    res.json(assignments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
