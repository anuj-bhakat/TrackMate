import supabase from '../config/supabaseClient.js';

// Insert with course membership check
export const createGroupDetail = async ({ group_refer_id, student_details_refer_id }) => {
  // 1. Fetch the group, with its course id
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('course_refer_id')
    .eq('id', group_refer_id)
    .single();

  if (groupError || !group) throw new Error('Group not found');

  // 2. Fetch the student_details and its courses object
  const { data: studentDetail, error: sdError } = await supabase
    .from('student_details')
    .select('courses')
    .eq('id', student_details_refer_id)
    .single();

  if (sdError || !studentDetail) throw new Error('Student details not found');

  // 3. Check if courses contain the group’s course id
  // courses is {"course_code": "course_id"}
  const courseEnrolled = !!Object.values(studentDetail.courses || {}).find(c => c === group.course_refer_id);

  if (!courseEnrolled) {
    throw new Error('Student is not enrolled in the course for this group');
  }

  // 4. All good, insert the record
  const { data, error } = await supabase
    .from('group_details')
    .insert([{ group_refer_id, student_details_refer_id }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Delete (by id)
export const deleteGroupDetail = async (id) => {
  const { error } = await supabase
    .from('group_details')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Group detail deleted successfully' };
};

// Get all group members for a group, with student details and student profile
export const getGroupMembersByGroupId = async (group_refer_id) => {
  const { data, error } = await supabase
    .from('group_details')
    .select(`
      *,
      student_details (
        id,
        refer_id,
        program_code,
        semester_code,
        students (
          id,
          student_id,
          name,
          username
        )
      )
    `)
    .eq('group_refer_id', group_refer_id);
  if (error) throw new Error(error.message);
  return data;
};

// Get group membership for a student_details record (optionally with group info)
export const getGroupsForStudentDetail = async (student_details_refer_id) => {
  const { data, error } = await supabase
    .from('group_details')
    .select(`
      *,
      groups (
        id,
        group_code,
        group_name,
        course_refer_id
      )
    `)
    .eq('student_details_refer_id', student_details_refer_id);
  if (error) throw new Error(error.message);
  return data;
};


// Get all students eligible for a group, by group_id
export const getEligibleStudentsForGroup = async (group_id) => {
  // 1. Find the group and its course_refer_id
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('course_refer_id')
    .eq('id', group_id)
    .single();
  if (groupError || !group) throw new Error('Group not found');

  const course_id = group.course_refer_id;

  // 2. Find all student_details records with this course_id in their courses
  const { data: students, error } = await supabase
    .from('student_details')
    .select(`
      id,
      refer_id,
      courses,
      students (
        id,
        student_id,
        name,
        username
      )
    `);
  
  if (error) throw new Error(error.message);

  // Filter students who have course_id in their courses object values
  const eligibleStudents = (students || []).filter(row => {
    return Object.values(row.courses || {}).includes(course_id);
  });

  return eligibleStudents;
};



// Utility: Get all students with their CGPA and backlog count eligible for this group
export const getEligibleStudentsWithCgpaAndBacklogs = async (group_id) => {
  // 1. Get group and course id
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('course_refer_id')
    .eq('id', group_id)
    .single();
  if (groupError || !group) throw new Error('Group not found');

  const course_id = group.course_refer_id;

  // 2. Find all student_details with this course_id in their courses
  const { data: students, error: studentsError } = await supabase
    .from('student_details')
    .select(`
      id,
      refer_id,
      courses,
      students (
        id,
        student_id,
        name,
        username
      )
    `);
  if (studentsError) throw new Error(studentsError.message);

  // Filter students who have course_id in their courses object values
  const eligibleStudents = (students || []).filter(row => {
    return Object.values(row.courses || {}).includes(course_id);
  });

  // 3. For each student: Get their CGPA (from program_grades) and backlog count (from course_grades)
  const results = [];
  for (const student of eligibleStudents) {
    const refer_id = student.refer_id;

    // Get CGPA from program_grades (can be multiple programs, use highest)
    const { data: programGrades, error: pgError } = await supabase
      .from('program_grades')
      .select('cgpa')
      .eq('student_id', refer_id);
    if (pgError) throw new Error(pgError.message);

    // Use highest CGPA from programs if multiple
    let cgpa = 0;
    if ((programGrades || []).length) {
      cgpa = Math.max(...programGrades.map(g => Number(g.cgpa) || 0));
    }

    // Count backlogs (course_grades where status = 'failed')
    const { data: courseBacklogs, error: cgError } = await supabase
      .from('course_grades')
      .select('id')
      .eq('status', 'failed')
      .in('sem_refer_id',
          // find all semester_grades entries for this student
          (await supabase.from('semester_grades')
                .select('id')
                .eq('student_id', refer_id)).data?.map(r => r.id) || []
      );
    if (cgError) throw new Error(cgError.message);

    const backlogCount = courseBacklogs ? courseBacklogs.length : 0;

    results.push({
      ...student,
      cgpa,
      backlogs: backlogCount
    });
  }

  return results;
};


export const getStudentsByCourseId = async (course_id) => {
  // Select all student_details, join students
  const { data: students, error } = await supabase
    .from('student_details')
    .select(`
      id,
      refer_id,
      courses,
      students (
        id,
        student_id,
        name,
        username
      )
    `);

  if (error) throw new Error(error.message);

  // Filter students where courses object contains the course_id
  const withCourse = (students || []).filter(row =>
    Object.values(row.courses || {}).includes(course_id)
  );
  return withCourse;
};



// Get all groups (with courses) for a given student_id (students.id)
export const getGroupsByStudentId = async (student_id) => {
  // Find student_details record(s) for student
  const { data: studentDetails, error: sdError } = await supabase
    .from('student_details')
    .select('id')
    .eq('refer_id', student_id);
  if (sdError) throw new Error(sdError.message);

  const detailIds = (studentDetails || []).map(sd => sd.id);
  if (detailIds.length === 0) return [];

  // Find all group_details records for those student_details ids, join groups AND courses
  const { data, error } = await supabase
    .from('group_details')
    .select(`
      *,
      groups (
        id,
        group_code,
        group_name,
        course_refer_id,
        courses (
          id,
          course_code,
          course_name,
          institution_id,
          assigned_faculty
        )
      )
    `)
    .in('student_details_refer_id', detailIds);
  if (error) throw new Error(error.message);

  return data;
};