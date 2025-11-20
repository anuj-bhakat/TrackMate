import supabase from '../config/supabaseClient.js';

export const insertCourseGrade = async (body) => {
  const { data, error } = await supabase.from('course_grades').insert([body]).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const modifyCourseGrade = async (id, updates) => {
  const { data, error } = await supabase.from('course_grades').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const getCourseGrade = async (id) => {
  const { data, error } = await supabase.from('course_grades').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteCourseGrade = async (id) => {
  const { error } = await supabase.from('course_grades').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Deleted successfully' };
};

export const getCourseGradesByStudentSemester = async (student_id, semester_id) => {
  // First get sem_grades record
  const { data: sem, error: semError } = await supabase
    .from('semester_grades')
    .select('id')
    .eq('student_id', student_id)
    .eq('semester_id', semester_id)
    .single();
  if (semError || !sem) throw new Error('Semester record not found');
  const sem_grade_id = sem.id;
  const { data, error } = await supabase
    .from('course_grades')
    .select('*')
    .eq('sem_refer_id', sem_grade_id);
  if (error) throw new Error(error.message);
  return data;
};
