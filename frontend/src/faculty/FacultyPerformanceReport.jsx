import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const FacultyPerformanceReport = ({ filteredReportData, reportOptions, selectedGroup, onModifyFilters, onBackToPerformance }) => {
  const handleExportExcel = () => {
    // Calculate summary statistics
    const totalStudents = filteredReportData.length;
    const totalMarksSum = filteredReportData.reduce((sum, student) => sum + (student.analytics?.total_marks || 0), 0);
    const maxMarks = filteredReportData[0]?.analytics?.max_total || 1;
    const averagePerformance = totalStudents > 0 ? ((totalMarksSum / totalStudents / maxMarks) * 100).toFixed(1) : 0;

    const excellentCount = filteredReportData.filter(student => {
      const analytics = student.analytics;
      const totalMarks = analytics?.total_marks || 0;
      const maxMarks = analytics?.max_total || 0;
      const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100) : 0;
      return percentage >= 90;
    }).length;

    // Prepare summary data for Excel
    const summaryData = [
      ['PERFORMANCE REPORT SUMMARY'],
      [''],
      ['Report Details:'],
      ['Group Name:', selectedGroup.group_name],
      ['Generated Date:', new Date().toLocaleDateString()],
      ['Generated Time:', new Date().toLocaleTimeString()],
      [''],
      ['Statistics:'],
      ['Total Filtered Students:', totalStudents],
      ['Total Marks Obtained:', totalMarksSum],
      ['Average Performance:', `${averagePerformance}%`],
      ['Excellent Performers (90%+):', excellentCount],
      [''],
      ['Report Options:'],
      ['Include Student Details:', reportOptions.includeStudentDetails ? 'Yes' : 'No'],
      ['Include Assignment Breakdown:', reportOptions.includeAssignmentBreakdown ? 'Yes' : 'No'],
      ['Include Performance Trends:', reportOptions.includePerformanceTrends ? 'Yes' : 'No'],
      [''],
      ['FILTERED STUDENT PERFORMANCE DATA'],
      ['']
    ];

    // Prepare student data headers
    const headers = [];
    if (reportOptions.includeStudentDetails) {
      headers.push('Student Name', 'Student ID');
    }
    headers.push('Total Marks', 'Percentage');
    if (reportOptions.includeAssignmentBreakdown) {
      headers.push('Assignments Completed');
    }
    headers.push('Performance Category');

    // Prepare student data rows
    const studentData = filteredReportData.map(student => {
      const analytics = student.analytics;
      const totalMarks = analytics?.total_marks || 0;
      const maxMarksValue = analytics?.max_total || 0;
      const percentage = maxMarksValue > 0 ? ((totalMarks / maxMarksValue) * 100).toFixed(1) : 0;
      const completedAssignments = analytics?.assignments?.filter(a => a.status === 'reviewed').length || 0;
      const totalAssignments = analytics?.assignments?.length || 0;

      let category = 'Poor';
      if (percentage >= 90) category = 'Excellent';
      else if (percentage >= 80) category = 'Good';
      else if (percentage >= 70) category = 'Average';
      else if (percentage >= 60) category = 'Below Average';

      const row = [];
      if (reportOptions.includeStudentDetails) {
        row.push(student.student_details?.students?.name || 'N/A');
        row.push(student.student_details?.students?.student_id || 'N/A');
      }
      row.push(`${totalMarks}/${maxMarksValue}`);
      row.push(`${percentage}%`);
      if (reportOptions.includeAssignmentBreakdown) {
        row.push(`${completedAssignments}/${totalAssignments}`);
      }
      row.push(category);

      return row;
    });

    // Combine summary and student data
    const allData = [...summaryData, headers, ...studentData];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Style the headers (make them bold)
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let col = 0; col <= headerRange.e.c; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: summaryData.length, c: col });
      if (ws[headerCell]) {
        ws[headerCell].s = { font: { bold: true } };
      }
    }

    // Auto-size columns
    const colWidths = [];
    if (reportOptions.includeStudentDetails) {
      colWidths.push({ wch: 20 }, { wch: 15 }); // Student Name, Student ID
    }
    colWidths.push({ wch: 15 }, { wch: 12 }); // Total Marks, Percentage
    if (reportOptions.includeAssignmentBreakdown) {
      colWidths.push({ wch: 20 }); // Assignments Completed
    }
    colWidths.push({ wch: 20 }); // Performance Category

    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Performance Report');

    // Generate filename and save
    const fileName = `performance_report_${selectedGroup.group_name}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    try {

      // Create a clone of the element to modify styles for PDF generation
      const clonedElement = element.cloneNode(true);

      // Function to recursively fix styles
      const fixStyles = (element) => {
        // Force override all styles that might contain oklch or other unsupported functions
        element.style.setProperty('background-color', '#ffffff', 'important');
        element.style.setProperty('color', '#000000', 'important');
        element.style.setProperty('border-color', '#e5e7eb', 'important');
        element.style.setProperty('background-image', 'none', 'important');
        element.style.setProperty('box-shadow', 'none', 'important');

        // Apply specific background colors based on Tailwind classes
        if (element.classList.contains('bg-white')) {
          element.style.setProperty('background-color', '#ffffff', 'important');
        } else if (element.classList.contains('bg-gray-50')) {
          element.style.setProperty('background-color', '#f9fafb', 'important');
        } else if (element.classList.contains('bg-gray-100')) {
          element.style.setProperty('background-color', '#f3f4f6', 'important');
        } else if (element.classList.contains('from-blue-50')) {
          element.style.setProperty('background-color', '#eff6ff', 'important');
        } else if (element.classList.contains('from-green-50')) {
          element.style.setProperty('background-color', '#f0fdf4', 'important');
        } else if (element.classList.contains('from-orange-50')) {
          element.style.setProperty('background-color', '#fff7ed', 'important');
        } else if (element.classList.contains('from-purple-50')) {
          element.style.setProperty('background-color', '#faf5ff', 'important');
        } else if (element.classList.contains('bg-blue-50')) {
          element.style.setProperty('background-color', '#eff6ff', 'important');
        } else if (element.classList.contains('bg-blue-200')) {
          element.style.setProperty('background-color', '#bfdbfe', 'important');
        } else if (element.classList.contains('bg-green-50')) {
          element.style.setProperty('background-color', '#f0fdf4', 'important');
        } else if (element.classList.contains('bg-green-200')) {
          element.style.setProperty('background-color', '#bbf7d0', 'important');
        } else if (element.classList.contains('bg-orange-50')) {
          element.style.setProperty('background-color', '#fff7ed', 'important');
        } else if (element.classList.contains('bg-orange-200')) {
          element.style.setProperty('background-color', '#fed7aa', 'important');
        } else if (element.classList.contains('bg-purple-50')) {
          element.style.setProperty('background-color', '#faf5ff', 'important');
        } else if (element.classList.contains('bg-purple-200')) {
          element.style.setProperty('background-color', '#e9d5ff', 'important');
        }

        // Fix text colors based on classes
        if (element.classList.contains('text-gray-900')) {
          element.style.setProperty('color', '#111827', 'important');
        } else if (element.classList.contains('text-gray-800')) {
          element.style.setProperty('color', '#1f2937', 'important');
        } else if (element.classList.contains('text-gray-700')) {
          element.style.setProperty('color', '#374151', 'important');
        } else if (element.classList.contains('text-gray-600')) {
          element.style.setProperty('color', '#4b5563', 'important');
        } else if (element.classList.contains('text-gray-500')) {
          element.style.setProperty('color', '#6b7280', 'important');
        } else if (element.classList.contains('text-blue-900')) {
          element.style.setProperty('color', '#1e3a8a', 'important');
        } else if (element.classList.contains('text-blue-800')) {
          element.style.setProperty('color', '#1e40af', 'important');
        } else if (element.classList.contains('text-blue-700')) {
          element.style.setProperty('color', '#1d4ed8', 'important');
        } else if (element.classList.contains('text-green-900')) {
          element.style.setProperty('color', '#14532d', 'important');
        } else if (element.classList.contains('text-green-800')) {
          element.style.setProperty('color', '#166534', 'important');
        } else if (element.classList.contains('text-green-700')) {
          element.style.setProperty('color', '#15803d', 'important');
        } else if (element.classList.contains('text-orange-900')) {
          element.style.setProperty('color', '#9a3412', 'important');
        } else if (element.classList.contains('text-orange-800')) {
          element.style.setProperty('color', '#9a3412', 'important');
        } else if (element.classList.contains('text-orange-700')) {
          element.style.setProperty('color', '#c2410c', 'important');
        } else if (element.classList.contains('text-purple-900')) {
          element.style.setProperty('color', '#581c87', 'important');
        } else if (element.classList.contains('text-purple-800')) {
          element.style.setProperty('color', '#5b21b6', 'important');
        } else if (element.classList.contains('text-purple-700')) {
          element.style.setProperty('color', '#7c3aed', 'important');
        } else if (element.classList.contains('text-red-900')) {
          element.style.setProperty('color', '#7f1d1d', 'important');
        } else if (element.classList.contains('text-red-800')) {
          element.style.setProperty('color', '#991b1b', 'important');
        } else if (element.classList.contains('text-red-700')) {
          element.style.setProperty('color', '#b91c1c', 'important');
        }

        // Fix border colors
        if (element.classList.contains('border-blue-200')) {
          element.style.setProperty('border-color', '#bfdbfe', 'important');
        } else if (element.classList.contains('border-green-200')) {
          element.style.setProperty('border-color', '#bbf7d0', 'important');
        } else if (element.classList.contains('border-orange-200')) {
          element.style.setProperty('border-color', '#fed7aa', 'important');
        } else if (element.classList.contains('border-purple-200')) {
          element.style.setProperty('border-color', '#e9d5ff', 'important');
        } else if (element.classList.contains('border-red-200')) {
          element.style.setProperty('border-color', '#fecaca', 'important');
        } else if (element.classList.contains('border-gray-200')) {
          element.style.setProperty('border-color', '#e5e7eb', 'important');
        }

        // Process child elements
        Array.from(element.children).forEach(child => fixStyles(child));
      };

      fixStyles(clonedElement);

      // Temporarily replace the original element with the cloned one
      const parent = element.parentNode;
      parent.replaceChild(clonedElement, element);

      const canvas = await html2canvas(clonedElement, {
        scale: 1.5, // Reduced scale to avoid memory issues
        useCORS: true,
        allowTaint: false, // Changed to false for better compatibility
        backgroundColor: '#ffffff',
        ignoreElements: (element) => {
          // Skip elements that might cause issues
          return element.tagName === 'BUTTON' ||
                 element.classList.contains('hover:shadow-xl') ||
                 element.classList.contains('transition-shadow');
        }
      });

      // Restore original element
      parent.replaceChild(element, clonedElement);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`performance_report_${selectedGroup.group_name}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error.message}`);
    }
  };
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Performance Report Results
            </h1>
            <p className="text-lg text-gray-600">
              Filtered report for {selectedGroup.group_name} - {filteredReportData.length} students found
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleExportPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
            <button
              onClick={onModifyFilters}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modify Filters
            </button>
            <button
              onClick={onBackToPerformance}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Performance
            </button>
          </div>
        </div>

        <div id="report-content">
          {filteredReportData.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Students Match the Filters</h3>
              <p className="text-gray-600">Try adjusting your filter criteria to see more results.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Report Header */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Performance Report</h2>
                  <p className="text-gray-600">Group: {selectedGroup.group_name} | Generated: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Report Summary */}
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-blue-900">{filteredReportData.length}</h3>
                        <p className="text-sm text-blue-700">Filtered Students</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-green-900">
                          {filteredReportData.reduce((sum, student) => sum + (student.analytics?.total_marks || 0), 0)}
                        </h3>
                        <p className="text-sm text-green-700">Total Marks</p>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-orange-900">
                          {filteredReportData.length > 0 ? ((filteredReportData.reduce((sum, student) => sum + (student.analytics?.total_marks || 0), 0) / filteredReportData.length / (filteredReportData[0]?.analytics?.max_total || 1)) * 100).toFixed(1) : 0}%
                        </h3>
                        <p className="text-sm text-orange-700">Average Performance</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-purple-900">
                          {filteredReportData.filter(student => {
                            const analytics = student.analytics;
                            const totalMarks = analytics?.total_marks || 0;
                            const maxMarks = analytics?.max_total || 0;
                            const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100) : 0;
                            return percentage >= 90;
                          }).length}
                        </h3>
                        <p className="text-sm text-purple-700">Excellent Performers</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtered Students Table */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Filtered Student Results</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {filteredReportData.length} students matching your criteria
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {reportOptions.includeStudentDetails && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student ID
                            </th>
                          </>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Marks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                        {reportOptions.includeAssignmentBreakdown && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assignments Completed
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Performance Category
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReportData.map((student) => {
                        const analytics = student.analytics;
                        const totalMarks = analytics?.total_marks || 0;
                        const maxMarks = analytics?.max_total || 0;
                        const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : 0;
                        const completedAssignments = analytics?.assignments?.filter(a => a.status === 'reviewed').length || 0;
                        const totalAssignments = analytics?.assignments?.length || 0;

                        let category = 'Poor';
                        if (percentage >= 90) category = 'Excellent';
                        else if (percentage >= 80) category = 'Good';
                        else if (percentage >= 70) category = 'Average';
                        else if (percentage >= 60) category = 'Below Average';

                        return (
                          <tr key={student.id}>
                            {reportOptions.includeStudentDetails && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.student_details?.students?.name || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {student.student_details?.students?.student_id || 'N/A'}
                                  </div>
                                </td>
                              </>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{totalMarks}/{maxMarks}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{percentage}%</div>
                            </td>
                            {reportOptions.includeAssignmentBreakdown && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{completedAssignments}/{totalAssignments}</div>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                category === 'Excellent' ? 'bg-green-100 text-green-800' :
                                category === 'Good' ? 'bg-blue-100 text-blue-800' :
                                category === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                                category === 'Below Average' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {category}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyPerformanceReport;