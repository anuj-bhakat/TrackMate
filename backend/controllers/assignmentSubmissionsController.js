import * as submissionService from '../services/assignmentSubmissionsService.js';
import cloudinary from '../config/cloudinary.js';

// Insert submission with file upload (PDF only)
export const createSubmission = async (req, res) => {
  try {
    const { assignment_refer_id, student_refer_id, text_submission } = req.body;
    let attachments = {};

    if (req.files && req.files.length > 0) {
      if (req.files.length > 10) return res.status(400).json({ error: 'Max 10 PDF files allowed.' });

      const sanitizeFileName = (name) =>
        name
          .replace(/[^a-zA-Z0-9.\-_]/g, '_')  // Replace all non-safe chars with _
          .replace(/_+/g, '_')                 // Collapse multiple _ to single
          .replace(/^_+|_+$/g, '');            // Remove leading/trailing _

      const uploadPromises = req.files.map(file => {
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '');
        const ext = file.originalname.includes('.') ? file.originalname.split('.').pop() : '';
        const baseName = ext
          ? file.originalname.substring(0, file.originalname.lastIndexOf('.'))
          : file.originalname;
        const safeBaseName = sanitizeFileName(baseName);
        const uniqueName = `${safeBaseName}_${timestamp}${ext ? '.' + ext : ''}`;

        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'assignment_submissions',
              public_id: uniqueName,
              overwrite: true,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve({ fileName: uniqueName, url: result.secure_url });
            }
          ).end(file.buffer);
        });
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      uploadedFiles.forEach(({ fileName, url }) => {
        attachments[fileName] = url;
      });
    }

    const submission = await submissionService.createSubmission({
      assignment_refer_id,
      student_refer_id,
      text_submission,
      attachments,
    });

    res.status(201).json(submission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a submission by id
export const deleteSubmission = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await submissionService.deleteSubmission(id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Review/update: set marks, comments, reviewed_at, status
export const reviewSubmission = async (req, res) => {
  const { id } = req.params;
  const { marks, comments } = req.body;
  try {
    const result = await submissionService.updateSubmissionReview(id, {
      marks: (marks !== undefined && marks !== null) ? parseFloat(marks) : null,
      comments
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Get submissions by assignment id
export const getSubmissionsByAssignment = async (req, res) => {
  const { assignment_refer_id } = req.params;
  try {
    const data = await submissionService.getSubmissionsByAssignment(assignment_refer_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get submission by id
export const getSubmissionById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await submissionService.getSubmissionById(id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get submissions by student id
export const getSubmissionsByStudent = async (req, res) => {
  const { student_refer_id } = req.params;
  try {
    const data = await submissionService.getSubmissionsByStudent(student_refer_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
