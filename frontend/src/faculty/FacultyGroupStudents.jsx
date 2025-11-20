import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const FacultyGroupStudents = ({ groupId, onBack, groupName }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroupStudents = async () => {
      try {
        const token = localStorage.getItem('facultyToken');
        const institutionId = localStorage.getItem('institutionId');

        if (!token || !institutionId) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${baseUrl}/api/group-details/group/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Institution-Id': institutionId
          }
        });

        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching group students:', error);
        setError(error.response?.data?.message || 'Failed to load group students');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupStudents();
    }
  }, [groupId]);

  const exportPDF = async () => {
    try {
      // Create a new jsPDF instance with better color support
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(59, 130, 246); // Blue color
      pdf.text(`${groupName || 'Group Students'} Report`, pageWidth / 2, 20, { align: 'center' });

      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128); // Gray color
      pdf.text(`Group: ${groupName || 'N/A'}`, pageWidth / 2, 30, { align: 'center' });
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 40, { align: 'center' });
      pdf.text(`Total Students: ${students.length}`, pageWidth / 2, 50, { align: 'center' });

      let y = 60;
      const lineHeight = 10;
      const colWidths = [15, 45, 30, 35, 35, 30]; // Column widths
      const startX = 20;

      // Draw table headers with colors
      pdf.setFillColor(248, 250, 252); // Light gray background
      pdf.rect(startX, y - 5, pageWidth - 40, 10, 'F');

      pdf.setFontSize(11);
      pdf.setTextColor(51, 65, 85); // Dark slate
      pdf.setFont('helvetica', 'bold');

      let currentX = startX;
      const headers = ['Sl. No.', 'Student Name', 'Student ID', 'Username', 'Program', 'Semester'];

      headers.forEach((header, index) => {
        pdf.text(header, currentX + 2, y + 2);
        currentX += colWidths[index];
      });

      y += lineHeight + 5;

      // Draw table data with alternating row colors and colored cells
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      students.forEach((student, index) => {
        if (y > pageHeight - 30) {
          pdf.addPage();
          y = 20;
        }

        // Alternate row background
        if (index % 2 === 0) {
          pdf.setFillColor(255, 255, 255); // White
        } else {
          pdf.setFillColor(248, 250, 252); // Light gray
        }
        pdf.rect(startX, y - 3, pageWidth - 40, lineHeight - 2, 'F');

        const name = student.student_details?.students?.name || 'N/A';
        const id = student.student_details?.students?.student_id || 'N/A';
        const username = student.student_details?.students?.username || 'N/A';
        const program = student.student_details?.program_code || 'N/A';
        const semester = student.student_details?.semester_code || 'N/A';

        const data = [`${index + 1}`, name, id, username, program, semester];
        const colors = [
          [0, 0, 0], // Black for Sl. No.
          [30, 64, 175], // Blue for name
          [22, 101, 52], // Green for ID
          [91, 33, 182], // Purple for username
          [154, 52, 18], // Orange for program
          [153, 27, 27]  // Red for semester
        ];

        currentX = startX;
        data.forEach((text, colIndex) => {
          // Draw colored background for data cells
          const bgColors = [
            [239, 246, 255], // Light blue
            [240, 253, 244], // Light green
            [250, 245, 255], // Light purple
            [255, 247, 237], // Light orange
            [254, 242, 242], // Light red
            [254, 242, 242]  // Light red
          ];

          if (colIndex > 0) { // Skip Sl. No. background
            pdf.setFillColor(bgColors[colIndex - 1][0], bgColors[colIndex - 1][1], bgColors[colIndex - 1][2]);
            pdf.rect(currentX, y - 3, colWidths[colIndex], lineHeight - 2, 'F');
          }

          // Draw border
          pdf.setDrawColor(203, 213, 225); // Light border
          pdf.rect(currentX, y - 3, colWidths[colIndex], lineHeight - 2);

          // Set text color
          if (colIndex === 0) {
            pdf.setTextColor(0, 0, 0); // Black for Sl. No.
          } else {
            pdf.setTextColor(colors[colIndex][0], colors[colIndex][1], colors[colIndex][2]);
          }

          // Add text with proper wrapping
          const maxWidth = colWidths[colIndex] - 4;
          const lines = pdf.splitTextToSize(text, maxWidth);
          let textY = y + 2;

          lines.forEach(line => {
            pdf.text(line, currentX + 2, textY);
            textY += 4;
          });

          currentX += colWidths[colIndex];
        });

        y += lineHeight;
      });

      pdf.save(`group_students_${groupName || 'students'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Simple fallback
      const pdf = new jsPDF();
      pdf.text('Error generating PDF. Please try again.', 20, 20);
      pdf.save('error.pdf');
    }
  };

  const exportExcel = () => {
    // Create metadata section
    const metadataRows = [
      ['GROUP STUDENTS REPORT'],
      [''],
      ['Report Information'],
      ['Group Name', groupName || 'N/A'],
      ['Generated Date', new Date().toLocaleDateString()],
      ['Generated Time', new Date().toLocaleTimeString()],
      ['Total Students', students.length],
      [''],
      ['STUDENT DATA'],
      [''],
      ['Sl. No.', 'Student Name', 'Student ID', 'Username', 'Program', 'Semester']
    ];

    // Create student data rows
    const studentDataRows = students.map((student, index) => [
      index + 1,
      student.student_details?.students?.name || 'N/A',
      student.student_details?.students?.student_id || 'N/A',
      student.student_details?.students?.username || 'N/A',
      student.student_details?.program_code || 'N/A',
      student.student_details?.semester_code || 'N/A'
    ]);

    // Combine metadata and student data
    const allRows = [...metadataRows, ...studentDataRows];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    // Style the headers (make them bold)
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let row = 0; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) continue;

        // Make report title bold
        if (row === 0) {
          ws[cellAddress].s = { font: { bold: true, sz: 14 } };
        }
        // Make section headers bold
        else if (row === 2 || row === 8) {
          ws[cellAddress].s = { font: { bold: true, sz: 12 } };
        }
        // Make column headers bold
        else if (row === 10) {
          ws[cellAddress].s = { font: { bold: true } };
        }
      }
    }

    // Auto-size columns
    const colWidths = [
      { wch: 8 },  // Sl. No.
      { wch: 20 }, // Student Name
      { wch: 15 }, // Student ID
      { wch: 15 }, // Username
      { wch: 15 }, // Program
      { wch: 12 }  // Semester
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `group_students_${groupName || 'students'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Group Students</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBack}
                className="inline-flex items-center px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md group text-sm"
              >
                <svg className="w-4 h-4 mr-1.5 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Groups
              </button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {groupName || 'Group Students'}
                </h1>
                <p className="text-sm text-slate-600">Student enrollment and academic information</p>
              </div>
              
              <div className="w-20"></div> {/* Spacer for centering */}
            </div>
          </div>

          {students.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">No Students Enrolled</h3>
                <p className="text-slate-600 mb-6">This group currently has no students assigned. Students will appear here once they are enrolled in this group.</p>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-blue-800">Administrative Notice</h4>
                      <p className="text-sm text-blue-600">Contact your institution administrator to assign students to this group.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
                  {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-white/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">Total Students</p>
                      <p className="text-2xl font-bold text-slate-900">{students.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-white/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">Current Semester</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {[...new Set(students.map(s => s.student_details?.semester_code).filter(Boolean))].join(', ') || 'N/A'}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Students Directory */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Group Students</h2>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">
                        <span className="text-sm font-medium">{students.length} Students</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Sl. No.
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <svg className="w-3 h-3 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Student Name
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <svg className="w-3 h-3 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Student ID
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <svg className="w-3 h-3 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            Username
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <svg className="w-3 h-3 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Program
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <svg className="w-3 h-3 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Semester
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {students.map((student, index) => {
                        const studentName = student.student_details?.students?.name || 'N/A';
                        const studentId = student.student_details?.students?.student_id || 'N/A';
                        const username = student.student_details?.students?.username || 'N/A';
                        const programCode = student.student_details?.program_code || 'N/A';
                        const semesterCode = student.student_details?.semester_code || 'N/A';
                      
                        
                        return (
                          <tr key={student.id} className={`group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-slate-900">{index + 1}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="bg-blue-50 border border-blue-200 rounded-md px-2 py-1 inline-block">
                                <div className="text-sm font-bold text-blue-800">{studentName}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="bg-green-50 border border-green-200 rounded-md px-2 py-1 inline-block">
                                <div className="text-sm font-bold text-green-800">{studentId}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="bg-purple-50 border border-purple-200 rounded-md px-2 py-1 inline-block">
                                <div className="text-sm font-medium text-purple-800">{username}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="bg-orange-50 border border-orange-200 rounded-md px-2 py-1 inline-block">
                                <div className="text-sm font-bold text-orange-800">{programCode}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="bg-red-50 border border-red-200 rounded-md px-2 py-1 inline-block">
                                <div className="text-sm font-bold text-red-800">{semesterCode}</div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-white/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    <span className="font-medium">{students.length}</span> student{students.length !== 1 ? 's' : ''} enrolled in {groupName || 'this group'}
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={exportPDF} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export as PDF
                    </button>
                    <button onClick={exportExcel} className="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors duration-200 text-sm font-medium">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Excel
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyGroupStudents;