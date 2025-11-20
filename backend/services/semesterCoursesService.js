import supabase from '../config/supabaseClient.js';

// Weightage validation helper
const isWeightageValid = (weightage) => {
  if (typeof weightage !== 'object' || weightage === null) return false;
  const sum = Object.values(weightage).reduce((acc, v) => acc + Number(v), 0);
  return sum === 100;
};

// Insert
export const createSemesterCourse = async ({ semester_refer_id, course_code, course_name, credits, weightage }) => {
  if (weightage && !isWeightageValid(weightage)) {
    throw new Error('Weightage values must sum to 100');
  }
  const { data, error } = await supabase
    .from('semester_courses')
    .insert([{ semester_refer_id, course_code, course_name, credits, weightage }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Update
export const updateSemesterCourse = async (id, updates) => {
  if (updates.weightage && !isWeightageValid(updates.weightage)) {
    throw new Error('Weightage values must sum to 100');
  }
  const { data, error } = await supabase
    .from('semester_courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Delete
export const deleteSemesterCourse = async (id) => {
  const { error } = await supabase
    .from('semester_courses')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Semester course deleted successfully' };
};

// Get by semester_refer_id
export const getSemesterCoursesBySemesterId = async (semester_refer_id) => {
  const { data, error } = await supabase
    .from('semester_courses')
    .select('*')
    .eq('semester_refer_id', semester_refer_id);
  if (error) throw new Error(error.message);
  return data;
};

// Get by program_refer_id (join program_semesters)
export const getSemesterCoursesByProgramId = async (programs_refer_id) => {
  const { data: semesters, error: semesterErr } = await supabase
    .from('program_semesters')
    .select('id')
    .eq('programs_refer_id', programs_refer_id);
  if (semesterErr) throw new Error(semesterErr.message);

  const semesterIds = (semesters || []).map(ps => ps.id);
  if (semesterIds.length === 0) return [];

  const { data, error } = await supabase
    .from('semester_courses')
    .select(`
      *,
      program_semesters (
        id,
        programs_refer_id,
        semester_name,
        semester_sequence
      )
    `)
    .in('semester_refer_id', semesterIds);
  if (error) throw new Error(error.message);
  return data;
};


// Get a specific course by its id
export const getSemesterCourseById = async (id) => {
  const { data, error } = await supabase
    .from('semester_courses')
    .select(`
      *,
      program_semesters (
        id,
        programs_refer_id,
        semester_name,
        semester_sequence
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};