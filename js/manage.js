// Simple Helper Functions for Modals & Tabs (No Bootstrap required)
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function switchTab(tabTargetId) {
    document.querySelectorAll('.nav-tabs .nav-link').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));

    const targetBtn = document.querySelector(`[data-bs-target="${tabTargetId}"]`) || document.querySelector(`[data-target="${tabTargetId}"]`);
    const targetPane = document.querySelector(tabTargetId);

    if (targetBtn) targetBtn.classList.add('active');
    if (targetPane) targetPane.classList.add('show', 'active');
}

document.addEventListener('DOMContentLoaded', function() {
    // Tab switch click handlers
    document.querySelectorAll('.nav-tabs .nav-link').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-bs-target') || this.getAttribute('data-target');
            if (target) switchTab(target);
        });
    });

    // Modal dismiss buttons (data-bs-dismiss="modal")
    document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
            }
        });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
                this.style.display = 'none';
            }
        });
    });

    // Check query params to activate specific tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'classes') {
        switchTab('#classes');
    }

    // Initial render
    renderStudents();
    renderClasses();
    populateClassSelects();

    // Event Listeners
    document.getElementById('search-student').addEventListener('input', function(e) {
        renderStudents(e.target.value.trim());
    });

    document.getElementById('student-form').addEventListener('submit', handleStudentSubmit);
    document.getElementById('class-form').addEventListener('submit', handleClassSubmit);
});

// ALERT SYSTEM
function showAlert(message, type = 'success') {
    const container = document.getElementById('alert-container');
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

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
        if (alertDiv && alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 3500);
}

// ----------------------------------------------------
// STUDENTS MANAGEMENT
// ----------------------------------------------------

function renderStudents(filterText = '') {
    const students = getStudents();
    const classes = getClasses();
    const tbody = document.getElementById('student-table-body');
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-1"></i> No student records found.
                </td>
            </tr>
        `;
        return;
    }

    const filtered = students.filter(s => {
        const text = filterText.toLowerCase();
        const className = (classes.find(c => c.id === s.classId)?.name || '').toLowerCase();
        return s.id.toLowerCase().includes(text) ||
            s.name.toLowerCase().includes(text) ||
            s.phone.toLowerCase().includes(text) ||
            className.includes(text);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    No students match search filter "${escapeHtml(filterText)}"
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(student => {
        const cls = classes.find(c => c.id === student.classId);
        const className = cls ? cls.name : 'Unassigned';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${student.id}</code></td>
            <td><strong>${escapeHtml(student.name)}</strong></td>
            <td>${student.gender}</td>
            <td><span class="badge bg-light text-dark border">${escapeHtml(className)}</span></td>
            <td>${escapeHtml(student.phone)}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="showEditStudentModal('${student.id}')">
                    <i class="bi bi-pencil-fill"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="handleDeleteStudent('${student.id}')">
                    <i class="bi bi-trash-fill"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function populateClassSelects() {
    const classes = getClasses();
    const studentClassSelect = document.getElementById('student-class');

    studentClassSelect.innerHTML = '<option value="" disabled selected>Select class</option>';

    classes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name} (${c.id})`;
        studentClassSelect.appendChild(opt);
    });
}

function showAddStudentModal() {
    document.getElementById('studentModalLabel').textContent = 'Add New Student';
    document.getElementById('student-action-mode').value = 'add';
    document.getElementById('student-id').disabled = false;
    
    // Clear form
    document.getElementById('student-form').reset();
    document.getElementById('student-id').classList.remove('is-invalid');
    
    populateClassSelects();
    openModal('studentModal');
}

function showEditStudentModal(studentId) {
    const students = getStudents();
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    document.getElementById('studentModalLabel').textContent = 'Edit Student Details';
    document.getElementById('student-action-mode').value = 'edit';
    document.getElementById('original-student-id').value = student.id;
    
    // Set fields
    document.getElementById('student-id').value = student.id;
    document.getElementById('student-id').disabled = true; // Lock key ID
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-gender').value = student.gender;
    document.getElementById('student-phone').value = student.phone;
    
    populateClassSelects();
    document.getElementById('student-class').value = student.classId;

    document.getElementById('student-id').classList.remove('is-invalid');
    openModal('studentModal');
}

function handleStudentSubmit(e) {
    e.preventDefault();

    const mode = document.getElementById('student-action-mode').value;
    const studentIdInput = document.getElementById('student-id');
    const id = studentIdInput.value.trim().toUpperCase();
    const name = document.getElementById('student-name').value.trim();
    const gender = document.getElementById('student-gender').value;
    const classId = document.getElementById('student-class').value;
    const phone = document.getElementById('student-phone').value.trim();

    let students = getStudents();

    if (mode === 'add') {
        // Validate unique ID
        if (students.some(s => s.id === id)) {
            studentIdInput.classList.add('is-invalid');
            return;
        }

        students.push({ id, name, gender, classId, phone });
        saveStudents(students);
        showAlert(`Student ${name} added successfully!`, 'success');
    } else {
        // Edit mode
        const originalId = document.getElementById('original-student-id').value;
        const index = students.findIndex(s => s.id === originalId);
        
        if (index !== -1) {
            students[index] = { id: originalId, name, gender, classId, phone };
            saveStudents(students);
            showAlert(`Student ${name} updated successfully!`, 'success');
        }
    }

    closeModal('studentModal');
    renderStudents();
}

function handleDeleteStudent(studentId) {
    if (confirm(`Are you sure you want to delete student with ID: ${studentId}?`)) {
        let students = getStudents();
        const student = students.find(s => s.id === studentId);
        const name = student ? student.name : studentId;

        // Filter out student
        students = students.filter(s => s.id !== studentId);
        saveStudents(students);

        // Clean up attendance records for this student
        let records = getAttendanceRecords();
        records = records.filter(r => r.studentId !== studentId);
        saveAttendanceRecords(records);

        showAlert(`Student ${name} has been deleted.`, 'danger');
        renderStudents();
    }
}


// ----------------------------------------------------
// CLASSES MANAGEMENT
// ----------------------------------------------------

function renderClasses() {
    const classes = getClasses();
    const tbody = document.getElementById('class-table-body');
    tbody.innerHTML = '';

    if (classes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-1"></i> No classes registered.
                </td>
            </tr>
        `;
        return;
    }

    classes.forEach(c => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><code>${c.id}</code></td>
            <td><strong>${escapeHtml(c.name)}</strong></td>
            <td>${escapeHtml(c.teacher)}</td>
            <td>${escapeHtml(c.schedule)}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" onclick="handleDeleteClass('${c.id}')">
                    <i class="bi bi-trash-fill"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddClassModal() {
    document.getElementById('class-form').reset();
    document.getElementById('class-id').classList.remove('is-invalid');
    openModal('classModal');
}

function handleClassSubmit(e) {
    e.preventDefault();

    const classIdInput = document.getElementById('class-id');
    const id = classIdInput.value.trim().toUpperCase();
    const name = document.getElementById('class-name').value.trim();
    const teacher = document.getElementById('class-teacher').value.trim();
    const schedule = document.getElementById('class-schedule').value.trim();

    let classes = getClasses();

    // Validate unique Class ID
    if (classes.some(c => c.id === id)) {
        classIdInput.classList.add('is-invalid');
        return;
    }

    classes.push({ id, name, teacher, schedule });
    saveClasses(classes);
    showAlert(`Class ${name} added successfully!`, 'success');

    closeModal('classModal');
    renderClasses();
    populateClassSelects(); // Sync student dropdowns
}

function handleDeleteClass(classId) {
    const students = getStudents();
    
    // Check if class has students enrolled
    const hasStudents = students.some(s => s.classId === classId);
    if (hasStudents) {
        showAlert('Cannot delete class because it has enrolled students. Reassign or delete them first!', 'danger');
        return;
    }

    if (confirm(`Are you sure you want to delete class with ID: ${classId}?`)) {
        let classes = getClasses();
        const classObj = classes.find(c => c.id === classId);
        const className = classObj ? classObj.name : classId;

        classes = classes.filter(c => c.id !== classId);
        saveClasses(classes);

        // Clean up attendance records for this class
        let records = getAttendanceRecords();
        records = records.filter(r => r.classId !== classId);
        saveAttendanceRecords(records);

        showAlert(`Class ${className} has been deleted.`, 'danger');
        renderClasses();
        populateClassSelects(); // Sync student dropdowns
    }
}


// Helper: Escape HTML strings for safety
function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
