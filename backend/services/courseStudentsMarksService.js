import supabase from '../config/supabaseClient.js';

// Insert
export const createCourseStudentMarks = async ({ semester_courses_refer_id, student_refer_id, marks }) => {
  const { data, error } = await supabase
    .from('course_students_marks')
    .insert([{ semester_courses_refer_id, student_refer_id, marks }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Update
export const updateCourseStudentMarks = async (id, updates) => {
  const { data, error } = await supabase
    .from('course_students_marks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Delete
export const deleteCourseStudentMarks = async (id) => {
  const { error } = await supabase
    .from('course_students_marks')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Marks record deleted successfully' };
};

// Get by student_id, include course details
export const getMarksByStudentId = async (student_refer_id) => {
  const { data, error } = await supabase
    .from('course_students_marks')
    .select(`
      *,
      semester_courses (
        id,
        course_code,
        course_name,
        credits,
        weightage,
        program_semesters (
          id,
          semester_name,
          semester_sequence,
          programs_refer_id
        )
      )
    `)
    .eq('student_refer_id', student_refer_id);
  if (error) throw new Error(error.message);
  return data;
};

// Get by course (semester_courses) id, include student details
export const getMarksByCourseId = async (semester_courses_refer_id) => {
  const { data, error } = await supabase
    .from('course_students_marks')
    .select(`
      *,
      students:student_refer_id (
        id,
        student_id,
        name,
        username
      )
    `)
    .eq('semester_courses_refer_id', semester_courses_refer_id);
  if (error) throw new Error(error.message);
  return data;
};


export const getCourseMarksByCourseAndProgram = async (semester_courses_refer_id, program_id) => {
  // 1. Get all students in the program
  const { data: details, error: detailsErr } = await supabase
    .from('student_details')
    .select(`
      id,
      refer_id,
      students (
        id,
        institution_id,
        student_id,
        name,
        username
      )
    `)
    .eq('program_id', program_id);

  if (detailsErr) throw new Error(detailsErr.message);
  const studentList = details.filter(sd => sd.students).map(sd => sd.students);

  // 2. Get marks records for this course
  const { data: marksRows, error: marksErr } = await supabase
    .from('course_students_marks')
    .select('id, student_refer_id, marks')
    .eq('semester_courses_refer_id', semester_courses_refer_id);

  if (marksErr) throw new Error(marksErr.message);

  // 3. Map marks by student ID
  const marksMap = {};
  (marksRows || []).forEach(row => {
    marksMap[row.student_refer_id] = { id: row.id, marks: row.marks };
  });

  // 4. Attach marks (with marks record id if present, else null)
  const result = studentList.map(student => {
    const markRec = marksMap[student.id];
    return {
      ...student,
      marks_id: markRec ? markRec.id : null,
      marks: markRec ? markRec.marks : null
    };
  });

  return result;
};





// Helper for grade points (simple example: >90 = 10, >80 = 9, etc.)
function calcGradePoint(total, weightage) {
  // Assume marks totals are scaled to weightage
  if (total >= 91) return 10;
  if (total >= 81) return 9;
  if (total >= 71) return 8;
  if (total >= 61) return 7;
  if (total >= 51) return 6;
  if (total >= 41) return 5;
  if (total >= 35) return 4;
  return 0;
}

export const getStudentCompleteMarksBySemester = async (student_id) => {
  // Get student basic details
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id, institution_id, student_id, name, username')
    .eq('id', student_id)
    .single();
  if (studentErr) throw new Error(studentErr.message);

  // Get student_details for program_id
  const { data: studentDetail, error: detailErr } = await supabase
    .from('student_details')
    .select('program_id')
    .eq('refer_id', student_id)
    .single();
  if (detailErr) throw new Error(detailErr.message);

  const program_id = studentDetail.program_id;

  // Get all semesters for this program from program_semesters
  const { data: semesters, error: semErr } = await supabase
    .from('program_semesters')
    .select('id, semester_name, semester_sequence, programs_refer_id')
    .eq('programs_refer_id', program_id)
    .order('semester_sequence', { ascending: true });
  if (semErr) throw new Error(semErr.message);

  // Get all semester_courses for these semesters
  const semesterIds = semesters.map(s => s.id);
  const { data: semesterCourses, error: scErr } = await supabase
    .from('semester_courses')
    .select('id, semester_refer_id, course_code, course_name, credits, weightage')
    .in('semester_refer_id', semesterIds);
  if (scErr) throw new Error(scErr.message);

  // Get all marks for this student for these courses
  const courseIds = semesterCourses.map(c => c.id);
  const { data: marksRows, error: marksErr } = await supabase
    .from('course_students_marks')
    .select('id, semester_courses_refer_id, marks')
    .eq('student_refer_id', student_id)
    .in('semester_courses_refer_id', courseIds);
  if (marksErr) throw new Error(marksErr.message);

  const marksMap = {};
  marksRows.forEach(row => { marksMap[row.semester_courses_refer_id] = { id: row.id, marks: row.marks }; });

  // Organize by semester id from program_semesters
  const semesterCourseMap = {};
  semesterCourses.forEach(course => {
    if (!semesterCourseMap[course.semester_refer_id]) semesterCourseMap[course.semester_refer_id] = [];
    semesterCourseMap[course.semester_refer_id].push(course);
  });

  const semestersOutput = semesters.map(sem => {
    const coursesForSemester = semesterCourseMap[sem.id] || [];
    return {
      semester_id: sem.id,
      semester_name: sem.semester_name,
      semester_sequence: sem.semester_sequence,
      courses: coursesForSemester.map(course => {
        const marksRec = marksMap[course.id];
        let totalMarks = 0;
        if (marksRec && marksRec.marks) {
          totalMarks = Object.values(marksRec.marks).reduce((acc, n) => acc + Number(n), 0);
        }
        const grade_point = marksRec ? calcGradePoint(totalMarks, course.weightage) : null;
        return {
          course_id: course.id,
          course_code: course.course_code,
          course_name: course.course_name,
          credits: course.credits,
          weightage: course.weightage,
          marks: marksRec ? marksRec.marks : null,
          marks_id: marksRec ? marksRec.id : null,
          total_marks: totalMarks,
          grade_point
        };
      })
    };
  });

  return {
    student,
    semesters: semestersOutput
  };
};



export const getAllStudentsMarksSummaryByProgramSemester = async (program_id, semester_id) => {
  // 1. Get all students in this program and semester, via student_details
  const { data: sdRows, error: studentsErr } = await supabase
    .from('student_details')
    .select(`
      refer_id,
      id,
      students (
        id, institution_id, student_id, name, username
      )
    `)
    .eq('program_id', program_id);

  if (studentsErr) throw new Error(studentsErr.message);

  const students = sdRows.filter(sd => sd.students).map(sd => sd.students);

  // 2. Get all courses for this semester (program_semesters)
  const { data: semesterCourses, error: scErr } = await supabase
    .from('semester_courses')
    .select('id, semester_refer_id, course_code, course_name, credits, weightage')
    .eq('semester_refer_id', semester_id);

  if (scErr) throw new Error(scErr.message);

  const courseIds = semesterCourses.map(c => c.id);
  const studentIds = students.map(s => s.id);

  // 3. Get all marks for these students in these courses
  const { data: marksRows, error: marksErr } = await supabase
    .from('course_students_marks')
    .select('id, semester_courses_refer_id, student_refer_id, marks')
    .in('student_refer_id', studentIds)
    .in('semester_courses_refer_id', courseIds);

  if (marksErr) throw new Error(marksErr.message);

  // 4. Map marks by student & course
  const marksMap = {};
  marksRows.forEach(row => {
    if (!marksMap[row.student_refer_id]) marksMap[row.student_refer_id] = {};
    marksMap[row.student_refer_id][row.semester_courses_refer_id] = { id: row.id, marks: row.marks };
  });

  // 5. Assemble per student
  const result = students.map(student => {
    const courses = semesterCourses.map(course => {
      const marksRec =
        marksMap[student.id] && marksMap[student.id][course.id]
          ? marksMap[student.id][course.id]
          : null;
      let totalMarks = 0;
      if (marksRec && marksRec.marks) {
        totalMarks = Object.values(marksRec.marks).reduce((acc, n) => acc + Number(n), 0);
      }
      const grade_point = marksRec ? calcGradePoint(totalMarks) : null;
      return {
        course_id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        credits: course.credits,
        weightage: course.weightage,
        marks: marksRec ? marksRec.marks : null,
        marks_id: marksRec ? marksRec.id : null,
        total_marks: totalMarks,
        grade_point
      };
    });
    return {
      student,
      courses
    };
  });

  return result;
};