import supabase from '../config/supabaseClient.js';

export const getStudentsAssignmentSummaryByGroupId = async (group_id) => {
  // 1. Get group members
  const { data: members, error: membersError } = await supabase
    .from('group_details')
    .select(`
      student_details_refer_id,
      student_details (
        id,
        refer_id,
        students (
          id,
          student_id,
          name,
          username
        )
      )
    `)
    .eq('group_refer_id', group_id);

  if (membersError) throw new Error(membersError.message);

  // Flatten to student info
  const students = (members || []).map(m => ({
    student_details_id: m.student_details.id,
    student_id: m.student_details.students.student_id,
    name: m.student_details.students.name,
    username: m.student_details.students.username,
    students_id: m.student_details.students.id
  }));

  // 2. Get assignments for group
  const { data: assignments, error: assignError } = await supabase
    .from('assignments')
    .select('id, assignment_name, marks')
    .eq('group_refer_id', group_id);

  if (assignError) throw new Error(assignError.message);

  const assignmentIds = assignments.map(a => a.id);

  // Compute max total for group
  const max_total = assignments.reduce((sum, a) => sum + (a.marks || 0), 0);

  // 3. Get all submissions for these assignmentIds & students
  const { data: submissions, error: subError } = await supabase
    .from('assignment_submissions')
    .select('assignment_refer_id, student_refer_id, marks, status')
    .in('assignment_refer_id', assignmentIds);

  if (subError) throw new Error(subError.message);

  // Map to student-assignment
  const submissionMap = {};
  (submissions || []).forEach(s => {
    submissionMap[`${s.assignment_refer_id}_${s.student_refer_id}`] = s;
  });

  // 4. Build summary per student
  const results = students.map(student => {
    let total_marks = 0;
    const assignment_marks = assignments.map(a => {
      // Find submission for this assignment and student
      const key = `${a.id}_${student.students_id}`;
      const submission = submissionMap[key];

      let marks = 0;
      let status = 'not submitted';

      if (submission) {
        marks = submission.marks != null ? submission.marks : 0;
        status = submission.status || 'submitted';
      }
      total_marks += marks;

      return {
        assignment_id: a.id,
        assignment_name: a.assignment_name,
        marks: marks,
        status: status
      };
    });

    return {
      student_id: student.student_id,
      name: student.name,
      username: student.username,
      assignments: assignment_marks,
      total_marks: total_marks,
      max_total: max_total
    };
  });

  return results;
};
