let currentMarkingClassId = '';
let currentMarkingDate = '';
let currentMarkingStudents = [];

document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize Dates
    const todayStr = getTodayDateString();
    document.getElementById('mark-date').value = todayStr;
    document.getElementById('report-date').value = todayStr; // Show today's report by default

    // 2. Populate Dropdowns
    populateDropdowns();

    // 3. Set up event listeners
    document.getElementById('mark-filter-form').addEventListener('submit', handleLoadRoll);
    
    // Live report updating on filter changes
    document.getElementById('report-class').addEventListener('change', renderReport);
    document.getElementById('report-date').addEventListener('change', renderReport);
    document.getElementById('report-status').addEventListener('change', renderReport);

    // Initial render of report
    renderReport();
});

// ALERT SYSTEM
function showAlert(message, type = 'success') {
    const container = document.getElementById('alert-container');
    if (!container) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} shadow-sm border-0`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2"></i>
            <div>${escapeHtml(message)}</div>
        </div>
        <button type="button" class="btn-close" onclick="this.parentElement.remove()" aria-label="Close">
            <i class="bi bi-x-lg"></i>
        </button>
    `;
    container.appendChild(alertDiv);

    setTimeout(() => {
        if (alertDiv && alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 3500);
}

function populateDropdowns() {
    const classes = getClasses();
    const markClassSelect = document.getElementById('mark-class');
    const reportClassSelect = document.getElementById('report-class');

    // Reset except defaults
    markClassSelect.innerHTML = '<option value="" disabled selected>Select class</option>';
    reportClassSelect.innerHTML = '<option value="">All Classes</option>';

    classes.forEach(c => {
        // Mark Form select options
        const optionMark = document.createElement('option');
        optionMark.value = c.id;
        optionMark.textContent = c.name;
        markClassSelect.appendChild(optionMark);

        // Report Form select options
        const optionReport = document.createElement('option');
        optionReport.value = c.id;
        optionReport.textContent = c.name;
        reportClassSelect.appendChild(optionReport);
    });
}

// ----------------------------------------------------
// SECTION 1: MARK ATTENDANCE
// ----------------------------------------------------

function handleLoadRoll(e) {
    e.preventDefault();

    const classSelect = document.getElementById('mark-class');
    const dateInput = document.getElementById('mark-date');

    currentMarkingClassId = classSelect.value;
    currentMarkingDate = dateInput.value;

    const classes = getClasses();
    const selectedClass = classes.find(c => c.id === currentMarkingClassId);
    
    // Set labels
    document.getElementById('selected-class-name').textContent = selectedClass ? selectedClass.name : 'Unknown';

    // Get students in this class
    const students = getStudents();
    currentMarkingStudents = students.filter(s => s.classId === currentMarkingClassId);

    const markingArea = document.getElementById('attendance-marking-area');
    const emptyState = document.getElementById('marking-empty-state');
    const tbody = document.getElementById('attendance-marking-table-body');
    
    tbody.innerHTML = '';

    if (currentMarkingStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-1"></i> No students are currently enrolled in this class.
                </td>
            </tr>
        `;
        // Make marking area visible even for empty class to let user see status
        markingArea.classList.remove('d-none');
        emptyState.classList.add('d-none');
        return;
    }

    // Load existing records for this class & date
    const allRecords = getAttendanceRecords();
    const existingDayRecords = allRecords.filter(r => r.date === currentMarkingDate && r.classId === currentMarkingClassId);

    currentMarkingStudents.forEach(student => {
        // Find existing status or default to Present
        const existingRecord = existingDayRecords.find(r => r.studentId === student.id);
        const status = existingRecord ? existingRecord.status : 'Present';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${student.id}</code></td>
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td>${student.gender}</td>
            <td>
                <div class="btn-group attendance-btn-group w-100" role="group" aria-label="Attendance Status">
                    <!-- Present Button -->
                    <input type="radio" class="btn-check" name="status-${student.id}" id="present-${student.id}" value="Present" ${status === 'Present' ? 'checked' : ''}>
                    <label class="btn btn-outline-success" for="present-${student.id}">Present</label>

                    <!-- Late Button -->
                    <input type="radio" class="btn-check" name="status-${student.id}" id="late-${student.id}" value="Late" ${status === 'Late' ? 'checked' : ''}>
                    <label class="btn btn-outline-warning" for="late-${student.id}">Late</label>

                    <!-- Absent Button -->
                    <input type="radio" class="btn-check" name="status-${student.id}" id="absent-${student.id}" value="Absent" ${status === 'Absent' ? 'checked' : ''}>
                    <label class="btn btn-outline-danger" for="absent-${student.id}">Absent</label>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    markingArea.classList.remove('d-none');
    emptyState.classList.add('d-none');
}

function markAllPresent() {
    if (currentMarkingStudents.length === 0) return;

    currentMarkingStudents.forEach(student => {
        const presentRadio = document.getElementById(`present-${student.id}`);
        if (presentRadio) {
            presentRadio.checked = true;
        }
    });
}

function saveAttendanceSheet() {
    if (!currentMarkingClassId || !currentMarkingDate) {
        showAlert('Please load a class roll first!', 'danger');
        return;
    }

    if (currentMarkingStudents.length === 0) {
        showAlert('No student records to save.', 'warning');
        return;
    }

    let allRecords = getAttendanceRecords();

    // Iterate through current students and extract selections
    currentMarkingStudents.forEach(student => {
        const radioName = `status-${student.id}`;
        const selectedRadio = document.querySelector(`input[name="${radioName}"]:checked`);
        const status = selectedRadio ? selectedRadio.value : 'Present';

        // Check if record exists for student + date + class
        const index = allRecords.findIndex(r => r.date === currentMarkingDate && r.studentId === student.id && r.classId === currentMarkingClassId);
        
        const record = {
            date: currentMarkingDate,
            studentId: student.id,
            classId: currentMarkingClassId,
            status: status
        };

        if (index !== -1) {
            // Update
            allRecords[index] = record;
        } else {
            // Create
            allRecords.push(record);
        }
    });

    // Save back to LocalStorage
    saveAttendanceRecords(allRecords);
    showAlert('Attendance sheet saved and updated successfully!', 'success');

    // Refresh report history view automatically
    renderReport();
}


// ----------------------------------------------------
// SECTION 2: ATTENDANCE REPORT
// ----------------------------------------------------

function getFilteredReportRecords() {
    const classFilter = document.getElementById('report-class').value;
    const dateFilter = document.getElementById('report-date').value;
    const statusFilter = document.getElementById('report-status').value;

    const records = getAttendanceRecords();
    const students = getStudents();
    const classes = getClasses();

    // Enriched & filtered records
    return records.map(record => {
        const student = students.find(s => s.id === record.studentId);
        const classObj = classes.find(c => c.id === record.classId);
        return {
            ...record,
            studentName: student ? student.name : 'Unknown Student',
            className: classObj ? classObj.name : 'Unknown Class'
        };
    }).filter(record => {
        // Apply filters
        const matchesClass = !classFilter || record.classId === classFilter;
        const matchesDate = !dateFilter || record.date === dateFilter;
        const matchesStatus = !statusFilter || record.status === statusFilter;
        return matchesClass && matchesDate && matchesStatus;
    }).sort((a, b) => {
        // Sort by date descending, then class name, then student name
        if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
        }
        if (a.className !== b.className) {
            return a.className.localeCompare(b.className);
        }
        return a.studentName.localeCompare(b.studentName);
    });
}

function renderReport() {
    const filteredRecords = getFilteredReportRecords();
    const tbody = document.getElementById('report-table-body');
    tbody.innerHTML = '';

    if (filteredRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-1"></i> No attendance records match the selected filters.
                </td>
            </tr>
        `;
        return;
    }

    filteredRecords.forEach(record => {
        const tr = document.createElement('tr');
        
        let statusBadge = '';
        if (record.status === 'Present') {
            statusBadge = '<span class="badge badge-present"><i class="bi bi-check-circle-fill me-1"></i>Present</span>';
        } else if (record.status === 'Absent') {
            statusBadge = '<span class="badge badge-absent"><i class="bi bi-x-circle-fill me-1"></i>Absent</span>';
        } else if (record.status === 'Late') {
            statusBadge = '<span class="badge badge-late"><i class="bi bi-clock-fill me-1"></i>Late</span>';
        }

        tr.innerHTML = `
            <td>${formatDateDisplay(record.date)}</td>
            <td><code>${record.studentId}</code></td>
            <td><strong>${escapeHtml(record.studentName)}</strong></td>
            <td>${escapeHtml(record.className)}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}

// PRINT REPORT
function printReport() {
    const classFilter = document.getElementById('report-class');
    const dateFilter = document.getElementById('report-date').value;
    const statusFilter = document.getElementById('report-status').value;

    const className = classFilter.options[classFilter.selectedIndex]?.text || 'All Classes';
    const dateVal = dateFilter ? formatDateDisplay(dateFilter) : 'All Dates';
    const statusVal = statusFilter || 'All Statuses';

    // Populate Print details
    document.getElementById('print-filter-class').textContent = className;
    document.getElementById('print-filter-date').textContent = dateVal;
    document.getElementById('print-filter-status').textContent = statusVal;
    
    // Set timestamp
    const now = new Date();
    document.getElementById('print-generation-time').textContent = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

    // Call browser print
    window.print();
}

// EXPORT TO CSV
function exportReportToCSV() {
    const filteredRecords = getFilteredReportRecords();
    if (filteredRecords.length === 0) {
        showAlert('No records available to export.', 'warning');
        return;
    }

    let csvContent = 'Date,Student ID,Student Name,Class,Status\n';

    filteredRecords.forEach(r => {
        // Escape commas and quotes for standard CSV structure
        const escapedName = `"${r.studentName.replace(/"/g, '""')}"`;
        const escapedClass = `"${r.className.replace(/"/g, '""')}"`;
        csvContent += `${r.date},${r.studentId},${escapedName},${escapedClass},${r.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = getTodayDateString();
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Report_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('CSV report exported successfully!', 'success');
}

// Helpers
function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
