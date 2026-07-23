// ==========================================================================
// Student Attendance System - Data Layer with Cloud Sync
// ==========================================================================

const STORAGE_KEYS = {
    STUDENTS: 'attendance_students',
    CLASSES: 'attendance_classes',
    RECORDS: 'attendance_records'
};

// Date Helpers
function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getYesterdayDateString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Local Storage Accessors
function getStudents() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS)) || [];
}

function saveStudents(students) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

function getClasses() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES)) || [];
}

function saveClasses(classes) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
}

function getAttendanceRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS)) || [];
}

function saveAttendanceRecords(records) {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

// Initial Data Setup (Starts completely empty)
function initializeDefaultData() {
    if (localStorage.getItem(STORAGE_KEYS.STUDENTS) === null) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    }
    if (localStorage.getItem(STORAGE_KEYS.CLASSES) === null) {
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify([]));
    }
    if (localStorage.getItem(STORAGE_KEYS.RECORDS) === null) {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));
    }
}

// Initialize default empty data structure on load
initializeDefaultData();

