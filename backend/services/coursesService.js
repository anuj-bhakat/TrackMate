import supabase from '../config/supabaseClient.js';

// Create (assigned_faculty initially null)
export const createCourse = async ({ institution_id, program_code, semester_code, course_code, course_name }) => {
  const { data, error } = await supabase
    .from('courses')
    .insert([{ institution_id, program_code, semester_code, course_code, course_name, assigned_faculty: null }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Get all by program_code and semester_code (optionally institution_id)
export const getCoursesByProgramAndSemester = async (institution_id, program_code, semester_code) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('institution_id', institution_id)
    .eq('program_code', program_code)
    .eq('semester_code', semester_code);

  if (error) throw new Error(error.message);
  return data;
};

// Update course info (by id)
export const updateCourse = async (id, updates) => {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Delete course (by id)
export const deleteCourse = async (id) => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return { message: 'Course deleted successfully' };
};

// Assign faculty to course (by id)
export const assignFaculty = async (id, faculty_id) => {
  const { data, error } = await supabase
    .from('courses')
    .update({ assigned_faculty: faculty_id })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};


// Get all courses assigned to a specific faculty id
export const getCoursesByFacultyId = async (faculty_id) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('assigned_faculty', faculty_id);

  if (error) throw new Error(error.message);
  return data;
};

// Get all courses for a given institution_id
export const getCoursesByInstitutionId = async (institution_id) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('institution_id', institution_id);

  if (error) throw new Error(error.message);
  return data;
};