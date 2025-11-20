import supabase from '../config/supabaseClient.js';

// Insert with optional fields
export const createStudentDetail = async (payload) => {
  // Filter out undefined/null keys from payload
  const insertPayload = {};
  [
    "refer_id",
    "program_code",
    "program_id",
    "semester_code",
    "semester_id",
    "courses"
  ].forEach(key => {
    if (payload[key] !== undefined) {
      insertPayload[key] = payload[key];
    }
  });
  const { data, error } = await supabase
    .from('student_details')
    .insert([insertPayload])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Update: send only fields to update (by refer_id)
export const updateStudentDetail = async (refer_id, updates) => {
  const updatePayload = {};
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      updatePayload[key] = updates[key];
    }
  });
  const { data, error } = await supabase
    .from('student_details')
    .update(updatePayload)
    .eq('refer_id', refer_id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};


// Update courses only
export const updateStudentCourses = async (refer_id, courses) => {
  const { data, error } = await supabase
    .from('student_details')
    .update({ courses })
    .eq('refer_id', refer_id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Get complete list (by institution_id, program_code, semester_code, with joins)
export const getDetailsByInstitutionProgramSemester = async (institution_id, program_code, semester_code) => {
  const { data, error } = await supabase
    .from('student_details')
    .select(`
      *,
      semesters (
        institution_id
      )
    `)
    .eq('program_code', program_code)
    .eq('semester_code', semester_code)
    .eq('semesters.institution_id', institution_id); // filter by related semester's institution_id
  if (error) throw new Error(error.message);
  return data;
};


// Get full detail for one student by refer_id (join all)
export const getDetailByStudentId = async (refer_id) => {
  const { data, error } = await supabase
    .from('student_details')
    .select(`
      *,
      students (
        id, student_id, name, username
      ),
      programs (
        id, program_code, program_name
      ),
      semesters (
        id, semester_code, semester
      )
    `)
    .eq('refer_id', refer_id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Delete by refer_id
export const deleteStudentDetail = async (refer_id) => {
  const { error } = await supabase
    .from('student_details')
    .delete()
    .eq('refer_id', refer_id);
  if (error) throw new Error(error.message);
  return { message: 'Student detail deleted successfully' };
};


export const getStudentDetailsByInstitution = async (institution_id) => {
  const { data, error } = await supabase
    .from('student_details')
    .select(`
      *,
      students (
        id, student_id, name, username, institution_id
      )
    `)
    .eq('students.institution_id', institution_id);

  if (error) throw new Error(error.message);
  return data;
};