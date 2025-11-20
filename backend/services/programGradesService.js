import supabase from '../config/supabaseClient.js';

// Helper: Calculate aggregate CGPA and JSON values
export const computeAndUpsertProgramGrade = async (student_id, program_id) => {
  // 1. Get all semesters for this program
  const { data: semesters, error: semError } = await supabase
    .from('program_semesters')
    .select('id, semester_name')
    .eq('programs_refer_id', program_id);
  if (semError) throw new Error(semError.message);

  // 2. Gather semester grade records for those semesters, for this student
  const semesterIds = semesters.map(row => row.id);
  if (semesterIds.length === 0) throw new Error('No semesters found for this program');

  const { data: sgrades, error: gradesError } = await supabase
    .from('semester_grades')
    .select('semester_id, sgpa, grade_points, max_grade_points')
    .in('semester_id', semesterIds)
    .eq('student_id', student_id);

  if (gradesError) throw new Error(gradesError.message);

  // 3. Compose the semester_grades JSON (key: semester_name, value: sgpa)
  let semester_grades_json = {};
  let total_points = 0;
  let total_max = 0;

  for (const sg of sgrades) {
    const semObj = semesters.find(s => s.id === sg.semester_id);
    if (semObj) {
      semester_grades_json[semObj.semester_name] = sg.sgpa;
    }
    total_points += Number(sg.grade_points);
    total_max += Number(sg.max_grade_points);
  }

  const cgpa = total_max > 0 ? (total_points / (total_max / 10)).toFixed(2) : 0;

  // 4. UPSERT: Insert or update on (program_id, student_id)
  // (Supabase/Postgres requires ON CONFLICT clause)
  const { data, error } = await supabase
    .from('program_grades')
    .upsert([{
      program_id,
      student_id,
      semester_grades: semester_grades_json,
      grade_points: total_points,
      max_grade_points: total_max,
      cgpa
    }], { onConflict: ['program_id', 'student_id'] })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateProgramGrade = async (id, updates) => {
  const { data, error } = await supabase.from('program_grades')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getProgramGrade = async (id) => {
  const { data, error } = await supabase.from('program_grades')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteProgramGrade = async (id) => {
  const { error } = await supabase.from('program_grades')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Deleted successfully' };
};

export const getGradesByProgramId = async (program_id) => {
  const { data, error } = await supabase.from('program_grades')
    .select('*')
    .eq('program_id', program_id);
  if (error) throw new Error(error.message);
  return data;
};

export const getGradesByStudentId = async (student_id) => {
  const { data, error } = await supabase.from('program_grades')
    .select('*')
    .eq('student_id', student_id);
  if (error) throw new Error(error.message);
  return data;
};
