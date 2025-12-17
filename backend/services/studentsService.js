import supabase from '../config/supabaseClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;


export const signupStudent = async ({ institution_id, student_id, name, username, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('students')
    .insert([{ institution_id, student_id, name, username, password: hashedPassword }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const loginStudent = async (institution_id, username, password, isGuest = false) => {
  let queryUsername = username;
  let queryInstitutionId = institution_id;

  if (isGuest) {
    queryUsername = process.env.GUEST_USERNAME;
    queryInstitutionId = process.env.GUEST_INSTITUTION_ID;
  }

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('username', queryUsername)
    .eq('institution_id', queryInstitutionId)
    .single();

  if (error || !data) throw new Error('Invalid credentials');

  if (!isGuest) {
    const isValid = await bcrypt.compare(password, data.password);
    if (!isValid) throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: data.id, username: data.username, student_id: data.student_id, institution_id: data.institution_id, role: 'student' },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  return {
    token,
    user: {
      id: data.id,
      username: data.username,
      name: data.name,
      student_id: data.student_id,
      institution_id: data.institution_id
    }
  };
};


export const deleteStudent = async (institution_id, student_id) => {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('institution_id', institution_id)
    .eq('student_id', student_id);

  if (error) throw new Error(error.message);
  return { message: 'Student deleted successfully' };
};


export const modifyStudentPassword = async (institution_id, username, oldPassword, newPassword) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('institution_id', institution_id)
    .eq('username', username)
    .single();

  if (error || !data) throw new Error('User not found');

  const isMatch = await bcrypt.compare(oldPassword, data.password);
  if (!isMatch) throw new Error('Old password incorrect');

  const newHashed = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from('students')
    .update({ password: newHashed })
    .eq('institution_id', institution_id)
    .eq('username', username);

  if (updateError) throw new Error(updateError.message);

  return { message: 'Password updated successfully' };
};


export const getStudentsByInstitution = async (institution_id) => {
  const { data, error } = await supabase
    .from('students')
    .select('id, institution_id, student_id, name, username')
    .eq('institution_id', institution_id);

  if (error) throw new Error(error.message);

  return data;
};



