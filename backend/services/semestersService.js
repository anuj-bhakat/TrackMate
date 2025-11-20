import supabase from '../config/supabaseClient.js';

// Create (Insert)
export const createSemester = async ({ institution_id, program_code, semester, semester_code }) => {
  const { data, error } = await supabase
    .from('semesters')
    .insert([{ institution_id, program_code, semester, semester_code }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Get all by institution_id
export const getSemestersByInstitution = async (institution_id) => {
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('institution_id', institution_id);

  if (error) throw new Error(error.message);
  return data;
};

// Get all by institution_id and program_code
export const getSemestersByInstitutionAndProgram = async (institution_id, program_code) => {
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('institution_id', institution_id)
    .eq('program_code', program_code);

  if (error) throw new Error(error.message);
  return data;
};

// Update (Modify by institution_id, program_code, semester_code)
export const updateSemester = async (institution_id, program_code, semester_code, updates) => {
  const { data, error } = await supabase
    .from('semesters')
    .update(updates)
    .eq('institution_id', institution_id)
    .eq('program_code', program_code)
    .eq('semester_code', semester_code)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Delete (by institution_id, program_code, semester_code)
export const deleteSemester = async (institution_id, program_code, semester_code) => {
  const { error } = await supabase
    .from('semesters')
    .delete()
    .eq('institution_id', institution_id)
    .eq('program_code', program_code)
    .eq('semester_code', semester_code);

  if (error) throw new Error(error.message);
  return { message: 'Semester deleted successfully' };
};
