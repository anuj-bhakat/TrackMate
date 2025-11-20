import supabase from '../config/supabaseClient.js';

export const createInstitution = async (institution_name, institution_id) => {
  const { data, error } = await supabase
    .from('available_institutions')
    .insert([{ institution_name, institution_id }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getAllInstitutions = async () => {
  const { data, error } = await supabase.from('available_institutions').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const getInstitutionById = async (institution_id) => {
  const { data, error } = await supabase
    .from('available_institutions')
    .select('*')
    .eq('institution_id', institution_id)
    .single();

  if (error) throw new Error('Institution not found');
  return data;
};

export const updateInstitution = async (institution_id, institution_name) => {
  const { data, error } = await supabase
    .from('available_institutions')
    .update({ institution_name })
    .eq('institution_id', institution_id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteInstitution = async (institution_id) => {
  const { error } = await supabase
    .from('available_institutions')
    .delete()
    .eq('institution_id', institution_id);

  if (error) throw new Error(error.message);
  return { message: 'Institution deleted successfully' };
};
