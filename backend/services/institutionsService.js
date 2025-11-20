import supabase from '../config/supabaseClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const signupInstitutionAdmin = async ({ institution_id, username, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('institutions')
    .insert([{ institution_id, username, password: hashedPassword }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const loginInstitutionAdmin = async (institution_id, username, password) => {
  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('username', username)
    .eq('institution_id', institution_id)
    .single();

  if (error || !data) throw new Error('Invalid credentials');

  const isValid = await bcrypt.compare(password, data.password);
  if (!isValid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { id: data.id, username: data.username, institution_id: data.institution_id, role: 'institutionAdmin' },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  return { token, user: { id: data.id, username: data.username, institution_id: data.institution_id } };
};

export const deleteInstitutionAdmin = async (institution_id, username) => {
  const { error } = await supabase
    .from('institutions')
    .delete()
    .eq('institution_id', institution_id)
    .eq('username', username);

  if (error) throw new Error(error.message);
  return { message: 'Institution admin deleted successfully' };
};


export const modifyInstitutionPassword = async (institution_id, username, oldPassword, newPassword) => {
  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('institution_id', institution_id)
    .eq('username', username)
    .single();

  if (error || !data) throw new Error('User not found');

  const isMatch = await bcrypt.compare(oldPassword, data.password);
  if (!isMatch) throw new Error('Old password incorrect');

  const newHashed = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from('institutions')
    .update({ password: newHashed })
    .eq('institution_id', institution_id)
    .eq('username', username);

  if (updateError) throw new Error(updateError.message);

  return { message: 'Password updated successfully' };
};


export const getInstitutionAdminsByInstitution = async (institution_id) => {
  const { data, error } = await supabase
    .from('institutions')
    .select('id, institution_id, username')
    .eq('institution_id', institution_id);

  if (error) throw new Error(error.message);

  return data;
};
