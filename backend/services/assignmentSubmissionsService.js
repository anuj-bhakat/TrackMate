import supabase from '../config/supabaseClient.js';

// Insert submission
export const createSubmission = async ({
  assignment_refer_id,
  student_refer_id,
  text_submission,
  attachments
}) => {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .insert([{
      assignment_refer_id,
      student_refer_id,
      text_submission: text_submission || null,
      attachments,
      submitted_at: new Date().toISOString(), // server time
      status: 'submitted'
    }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Delete submission
export const deleteSubmission = async (id) => {
  const { error } = await supabase
    .from('assignment_submissions')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Submission deleted successfully' };
};

// Update submission (review marks/comments/reviewed_at)
export const updateSubmissionReview = async (id, { marks, comments }) => {
  // Get assignment's max marks first
  const { data: submission, error: subError } = await supabase
    .from('assignment_submissions')
    .select('assignment_refer_id')
    .eq('id', id)
    .single();
  if (subError || !submission) throw new Error('Submission not found');

  const { data: assignment, error: assignError } = await supabase
    .from('assignments')
    .select('marks')
    .eq('id', submission.assignment_refer_id)
    .single();
  if (assignError || !assignment) throw new Error('Assignment not found');

  if (marks > assignment.marks) throw new Error('Marks exceed assignment maximum');

  const { data, error } = await supabase
    .from('assignment_submissions')
    .update({
      marks,
      comments: comments || null,
      status: 'reviewed',
      reviewed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Get submission by assignment_id
export const getSubmissionsByAssignment = async (assignment_refer_id) => {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select(`
      *,
      students:student_refer_id (
        id,
        student_id,
        name,
        username
      )
    `)
    .eq('assignment_refer_id', assignment_refer_id);

  if (error) throw new Error(error.message);
  return data;
};



// Get submission by id
export const getSubmissionById = async (id) => {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Get submissions by student
export const getSubmissionsByStudent = async (student_refer_id) => {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select('*')
    .eq('student_refer_id', student_refer_id);
  if (error) throw new Error(error.message);
  return data;
};
