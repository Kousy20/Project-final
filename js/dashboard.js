document.addEventListener('DOMContentLoaded', function() {
    // 1. Set current date badge
    const todayStr = getTodayDateString();
    document.getElementById('current-date-badge').textContent = formatDateDisplay(todayStr);

    // 2. Load data from localStorage
    const students = getStudents();
    const classes = getClasses();
    const records = getAttendanceRecords();

    // 3. Filter records for today
    const todayRecords = records.filter(record => record.date === todayStr);

    // 4. Calculate stats
    const totalStudents = students.length;
    const totalClasses = classes.length;
    const presentToday = todayRecords.filter(r => r.status === 'Present').length;
    const absentToday = todayRecords.filter(r => r.status === 'Absent').length;
    const lateToday = todayRecords.filter(r => r.status === 'Late').length;
    
    const totalMarkedToday = presentToday + absentToday + lateToday;
    let attendanceRate = 0;
    if (totalMarkedToday > 0) {
        attendanceRate = Math.round(((presentToday + lateToday) / totalMarkedToday) * 100);
    }

    // 5. Update UI stats
    document.getElementById('stat-total-students').textContent = totalStudents;
    document.getElementById('stat-total-classes').textContent = totalClasses;
    document.getElementById('stat-present-today').textContent = presentToday;
    document.getElementById('stat-absent-today').textContent = absentToday;
    document.getElementById('stat-late-today').textContent = lateToday;
    document.getElementById('stat-attendance-rate').textContent = `${attendanceRate}%`;

    // Update count badge
    document.getElementById('today-record-count').textContent = `${todayRecords.length} Record(s)`;

    // 6. Populate today's attendance table
    const tableBody = document.getElementById('today-attendance-table-body');
    if (todayRecords.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-1"></i> No attendance marked for today yet.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = '';
    
    // Sort today's records by student name
    const enrichedRecords = todayRecords.map(record => {
        const student = students.find(s => s.id === record.studentId);
        const classObj = classes.find(c => c.id === record.classId);
        return {
            ...record,
            studentName: student ? student.name : 'Unknown Student',
            studentGender: student ? student.gender : 'N/A',
            className: classObj ? classObj.name : 'Unknown Class'
        };
    }).sort((a, b) => a.studentName.localeCompare(b.studentName));

    enrichedRecords.forEach(record => {
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
            <td><code>${record.studentId}</code></td>
            <td><strong>${escapeHtml(record.studentName)}</strong></td>
            <td>${escapeHtml(record.className)}</td>
            <td>${record.studentGender}</td>
            <td>${statusBadge}</td>
        `;
        tableBody.appendChild(tr);
    });
});

// Helper: Format YYYY-MM-DD to human readable string
function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Helper: Escape HTML strings for safety
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
