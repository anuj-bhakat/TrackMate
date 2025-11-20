import supabase from '../config/supabaseClient.js';

// Create (Insert)
export const createProgram = async ({ institution_id, program_code, program_name }) => {
  const { data, error } = await supabase
    .from('programs')
    .insert([{ institution_id, program_code, program_name }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Get all programs (optionally by institution)
export const getPrograms = async (institution_id) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('institution_id', institution_id);

  if (error) throw new Error(error.message);
  return data;
};


// Get program by institution and code
export const getProgramByCode = async (institution_id, program_code) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('institution_id', institution_id)
    .eq('program_code', program_code)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Update program by institution and code
export const updateProgram = async (institution_id, program_code, updates) => {
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('institution_id', institution_id)
    .eq('program_code', program_code)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Delete program by institution and code
export const deleteProgram = async (institution_id, program_code) => {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('institution_id', institution_id)
    .eq('program_code', program_code);

  if (error) throw new Error(error.message);
  return { message: 'Program deleted successfully' };
};


export const getStudentsByProgramId = async (program_id) => {
  // Get all student_details where program_id matches
  const { data: details, error } = await supabase
    .from('student_details')
    .select(`
      id,
      refer_id,
      program_id,
      semester_code,
      semester_id,
      courses,
      students (
        id,
        institution_id,
        student_id,
        name,
        username
      )
    `)
    .eq('program_id', program_id);

  if (error) throw new Error(error.message);

  // Collect student records (joined via student_details.refer_id → students.id)
  return details
    .filter(sd => sd.students)
    .map(sd => ({
      student_details_id: sd.id,
      program_id: sd.program_id,
      semester_code: sd.semester_code,
      semester_id: sd.semester_id,
      courses: sd.courses,
      ...sd.students
    }));
};