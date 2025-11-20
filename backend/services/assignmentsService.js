import supabase from '../config/supabaseClient.js';

// Insert assignment (with JSONB attachments)
// attachments: { [filename]: url }
export const createAssignment = async ({ group_refer_id, assignment_name, assignment_desc, attachments, assigned_on, due, marks }) => {
  const { data, error } = await supabase
    .from('assignments')
    .insert([{ group_refer_id, assignment_name, assignment_desc, attachments, assigned_on, due, marks }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Update assignment
export const updateAssignment = async (id, updates) => {
  const { data, error } = await supabase
    .from('assignments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Delete assignment
export const deleteAssignment = async (id) => {
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Assignment deleted successfully' };
};

// Get assignments by group id
export const getAssignmentsByGroupId = async (group_refer_id) => {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('group_refer_id', group_refer_id);
  if (error) throw new Error(error.message);
  return data;
};

// Get assignments by course id (join groups & assignments)
export const getAssignmentsByCourseId = async (course_id) => {
  const { data: groups, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('course_refer_id', course_id);
  if (groupError) throw new Error(groupError.message);

  const groupIds = (groups || []).map(g => g.id);
  if (groupIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .in('group_refer_id', groupIds);
  if (error) throw new Error(error.message);
  return data;
};
