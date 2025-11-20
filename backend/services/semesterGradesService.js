import supabase from '../config/supabaseClient.js';

export const insertSemesterGrade = async (body) => {
  const { data, error } = await supabase.from('semester_grades').insert([body]).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const modifySemesterGrade = async (id, updates) => {
  const { data, error } = await supabase.from('semester_grades').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const getSemesterGrade = async (id) => {
  const { data, error } = await supabase.from('semester_grades').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteSemesterGrade = async (id) => {
  const { error } = await supabase.from('semester_grades').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Deleted successfully' };
};

export const getSemestersByStudent = async (student_id) => {
  const { data, error } = await supabase.from('semester_grades').select('*').eq('student_id', student_id);
  if (error) throw new Error(error.message);
  return data;
};

export const getStudentsBySemester = async (semester_id) => {
  const { data, error } = await supabase.from('semester_grades').select('*').eq('semester_id', semester_id);
  if (error) throw new Error(error.message);
  return data;
};
