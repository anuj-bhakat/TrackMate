import supabase from '../config/supabaseClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const signupFaculty = async ({ institution_id, faculty_id, name, username, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('faculties')
    .insert([{ institution_id, faculty_id, name, username, password: hashedPassword }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const loginFaculty = async (institution_id, username, password) => {
  const { data, error } = await supabase
    .from('faculties')
    .select('*')
    .eq('username', username)
    .eq('institution_id', institution_id)
    .single();

  if (error || !data) throw new Error('Invalid credentials');

  const isValid = await bcrypt.compare(password, data.password);
  if (!isValid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { id: data.id, username: data.username, faculty_id: data.faculty_id, institution_id: data.institution_id, role: 'faculty' },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  return {
  token,
  user: {
    id: data.id,
    username: data.username,
    name: data.name,
    faculty_id: data.faculty_id,
    institution_id: data.institution_id
  }
};
};


export const deleteFaculty = async (institution_id, faculty_id) => {
  const { error } = await supabase
    .from('faculties')
    .delete()
    .eq('institution_id', institution_id)
    .eq('faculty_id', faculty_id);

  if (error) throw new Error(error.message);
  return { message: 'Faculty deleted successfully' };
};


export const modifyFacultyPassword = async (institution_id, username, oldPassword, newPassword) => {
  const { data, error } = await supabase
    .from('faculties')
    .select('*')
    .eq('institution_id', institution_id)
    .eq('username', username)
    .single();

  if (error || !data) throw new Error('User not found');

  const isMatch = await bcrypt.compare(oldPassword, data.password);
  if (!isMatch) throw new Error('Old password incorrect');

  const newHashed = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from('faculties')
    .update({ password: newHashed })
    .eq('institution_id', institution_id)
    .eq('username', username);

  if (updateError) throw new Error(updateError.message);

  return { message: 'Password updated successfully' };
};


export const getFacultiesByInstitution = async (institution_id) => {
  const { data, error } = await supabase
    .from('faculties')
    .select('id, institution_id, faculty_id, name, username')
    .eq('institution_id', institution_id);

  if (error) throw new Error(error.message);

  return data;
};
