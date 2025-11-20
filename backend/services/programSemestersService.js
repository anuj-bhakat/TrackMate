import supabase from '../config/supabaseClient.js';

// Insert
export const createProgramSemester = async ({ programs_refer_id, semester_name, semester_sequence }) => {
  const { data, error } = await supabase
    .from('program_semesters')
    .insert([{ programs_refer_id, semester_name, semester_sequence }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Update
export const updateProgramSemester = async (id, updates) => {
  const { data, error } = await supabase
    .from('program_semesters')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Delete
export const deleteProgramSemester = async (id) => {
  const { error } = await supabase
    .from('program_semesters')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Program semester deleted successfully' };
};

// Get by program id
export const getProgramSemestersByProgramId = async (programs_refer_id) => {
  const { data, error } = await supabase
    .from('program_semesters')
    .select('*')
    .eq('programs_refer_id', programs_refer_id)
    .order('semester_sequence', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};
