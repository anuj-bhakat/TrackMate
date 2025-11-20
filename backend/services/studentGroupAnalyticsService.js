import supabase from '../config/supabaseClient.js';

export const getStudentCompleteGroupData = async (student_id) => {
  // 1. Get student_details for this student
  const { data: detailRows, error: detailError } = await supabase
    .from('student_details')
    .select('id')
    .eq('refer_id', student_id);

  if (detailError) throw new Error(detailError.message);

  const studentDetailsIds = (detailRows || []).map(row => row.id);

  if (studentDetailsIds.length === 0) return [];

  // 2. Get all group_details for these student_details ids
  const { data: groupDetails, error: groupDetailsError } = await supabase
    .from('group_details')
    .select('group_refer_id')
    .in('student_details_refer_id', studentDetailsIds);

  if (groupDetailsError) throw new Error(groupDetailsError.message);

  const groupIds = groupDetails.map(row => row.group_refer_id);

  if (groupIds.length === 0) return [];

  // 3. Get actual groups WITH full courses info
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select(`
      id,
      group_code,
      group_name,
      course_refer_id,
      courses (
        id,
        institution_id,
        program_code,
        semester_code,
        course_code,
        course_name,
        assigned_faculty
      )
    `)
    .in('id', groupIds);

  if (groupsError) throw new Error(groupsError.message);

  // 4. Get all assignments for these groups
  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('id, assignment_name, marks, group_refer_id')
    .in('group_refer_id', groupIds);

  if (assignmentsError) throw new Error(assignmentsError.message);

  // 5. Get all submissions for this student
  const assignmentIds = assignments.map(assign => assign.id);
  const { data: submissions, error: submissionsError } = await supabase
    .from('assignment_submissions')
    .select('assignment_refer_id, marks, status')
    .eq('student_refer_id', student_id)
    .in('assignment_refer_id', assignmentIds);

  if (submissionsError) throw new Error(submissionsError.message);

  // Lookup maps
  const assignmentsByGroup = {};
  assignments.forEach(assign => {
    if (!assignmentsByGroup[assign.group_refer_id])
      assignmentsByGroup[assign.group_refer_id] = [];
    assignmentsByGroup[assign.group_refer_id].push(assign);
  });

  const submissionMap = {};
  submissions.forEach(sub => {
    submissionMap[sub.assignment_refer_id] = sub;
  });

  // 6. Assemble per group WITH full course details
  const result = groups.map(group => {
    const course = group.courses ? {
      id: group.courses.id,
      institution_id: group.courses.institution_id,
      program_code: group.courses.program_code,
      semester_code: group.courses.semester_code,
      course_code: group.courses.course_code,
      course_name: group.courses.course_name,
      assigned_faculty: group.courses.assigned_faculty
    } : null;

    const groupAssignments = assignmentsByGroup[group.id] || [];
    const max_total = groupAssignments.reduce((sum, a) => sum + (a.marks || 0), 0);

    const assignmentsSummary = groupAssignments.map(assign => {
      const sub = submissionMap[assign.id];
      return {
        assignment_id: assign.id,
        assignment_name: assign.assignment_name,
        marks: sub && sub.marks != null ? sub.marks : 0,
        status: sub && sub.status ? sub.status : 'not submitted',
        max_marks: assign.marks
      };
    });

    const total_marks = assignmentsSummary.reduce((sum, a) => sum + (a.marks || 0), 0);

    return {
      group_id: group.id,
      group_code: group.group_code,
      group_name: group.group_name,
      course, // Full course details included here!
      assignments: assignmentsSummary,
      total_marks,
      max_total
    };
  });

  return result;
};
