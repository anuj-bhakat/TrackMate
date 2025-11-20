import supabase from '../config/supabaseClient.js';

// Create group
export const createGroup = async ({ course_refer_id, group_code, group_name }) => {
  const { data, error } = await supabase
    .from('groups')
    .insert([{ course_refer_id, group_code, group_name }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Update group (by group id)
export const updateGroup = async (id, updates) => {
  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Delete group (by group id)
export const deleteGroup = async (id) => {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Group deleted successfully' };
};

// Get all groups by course id
export const getGroupsByCourseId = async (course_refer_id) => {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('course_refer_id', course_refer_id);
  if (error) throw new Error(error.message);
  return data;
};

// Get all groups by assigned faculty id (requires join with courses)
// export const getGroupsByFacultyId = async (faculty_id) => {
//   const { data, error } = await supabase
//     .from('groups')
//     .select(`
//       *,
//       courses (
//         id,
//         course_code,
//         assigned_faculty
//       )
//     `)
//     .eq('courses.assigned_faculty', faculty_id);
//   if (error) throw new Error(error.message);
//   return data;
// };
export const getGroupsByFacultyId = async (faculty_id) => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      courses!inner (
        id,
        course_code,
        assigned_faculty
      )
    `)
    .eq('courses.assigned_faculty', faculty_id);

  if (error) throw new Error(error.message);
  return data;
};



// Get all groups by institution_id (via join on courses table)
export const getGroupsByInstitutionId = async (institution_id) => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      courses (
        id,
        institution_id,
        course_code,
        course_name,
        assigned_faculty
      )
    `)
    .eq('courses.institution_id', institution_id);

  if (error) throw new Error(error.message);
  return data;
};