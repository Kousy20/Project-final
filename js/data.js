// ==========================================================================
// Student Attendance System - Data Layer with Cloud Sync
// ==========================================================================

const STORAGE_KEYS = {
    STUDENTS: 'attendance_students',
    CLASSES: 'attendance_classes',
    RECORDS: 'attendance_records'
};

// Cloud Database Endpoint (Free Global Cloud Sync)
const CLOUD_APP_KEY = 'sw15_attendance_system_db';
const CLOUD_BASE_URL = 'https://keyvalue.immanuel.co/api/KeyVal';

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
    syncToCloud('students', students);
}

function getClasses() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES)) || [];
}

function saveClasses(classes) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    syncToCloud('classes', classes);
}

function getAttendanceRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS)) || [];
}

function saveAttendanceRecords(records) {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    syncToCloud('records', records);
}

// ==========================================================================
// Cloud Database Sync Functions (Background Sync for Multi-device Access)
// ==========================================================================

function syncToCloud(key, data) {
    try {
        const jsonStr = encodeURIComponent(JSON.stringify(data));
        fetch(`${CLOUD_BASE_URL}/UpdateValue/${CLOUD_APP_KEY}/${key}/${jsonStr}`, {
            method: 'POST'
        }).catch(err => console.log('Cloud sync background note:', err));
    } catch (e) {
        console.log('Cloud sync note:', e);
    }
}

async function loadFromCloud() {
    try {
        // Load Students
        const resStudents = await fetch(`${CLOUD_BASE_URL}/GetValue/${CLOUD_APP_KEY}/students`);
        if (resStudents.ok) {
            const text = await resStudents.json();
            if (text && text !== "null") {
                const cloudStudents = typeof text === 'string' ? JSON.parse(text) : text;
                if (Array.isArray(cloudStudents) && cloudStudents.length > 0) {
                    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(cloudStudents));
                }
            }
        }

        // Load Classes
        const resClasses = await fetch(`${CLOUD_BASE_URL}/GetValue/${CLOUD_APP_KEY}/classes`);
        if (resClasses.ok) {
            const text = await resClasses.json();
            if (text && text !== "null") {
                const cloudClasses = typeof text === 'string' ? JSON.parse(text) : text;
                if (Array.isArray(cloudClasses) && cloudClasses.length > 0) {
                    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(cloudClasses));
                }
            }
        }

        // Load Attendance Records
        const resRecords = await fetch(`${CLOUD_BASE_URL}/GetValue/${CLOUD_APP_KEY}/records`);
        if (resRecords.ok) {
            const text = await resRecords.json();
            if (text && text !== "null") {
                const cloudRecords = typeof text === 'string' ? JSON.parse(text) : text;
                if (Array.isArray(cloudRecords) && cloudRecords.length > 0) {
                    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(cloudRecords));
                }
            }
        }
    } catch (e) {
        console.log('Using local cached database:', e);
    }
}

// Initial Data Setup for Class SW15
function initializeDefaultData() {
    const existingStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);

    if (!existingStudents) {
        const demoClasses = [
            { id: 'CLS_SW15', name: 'Class SW15', teacher: 'Mr. Long Kousy', schedule: 'Mon-Fri 08:00 AM - 11:00 AM' },
            { id: 'CLS002', name: 'Class SW16', teacher: 'Ms. Emily Davis', schedule: 'Tue-Thu 10:30 AM' }
        ];

        const demoStudents = [
            { id: 'STU001', name: 'Aing Vouchly (អាាំង វុចលី)', gender: 'Female', classId: 'CLS_SW15', phone: '02/03/2005' },
            { id: 'STU002', name: 'Borith Narin (បូរិទ្ធ ណារិន)', gender: 'Male', classId: 'CLS_SW15', phone: '01/02/2006' },
            { id: 'STU003', name: 'Borith Narinne (បូរិទ្ធ ណារីន)', gender: 'Male', classId: 'CLS_SW15', phone: '24/02/2004' },
            { id: 'STU004', name: 'Chheang Vandy (ឈៀង វណ្ណឌី)', gender: 'Male', classId: 'CLS_SW15', phone: '20/12/2006' },
            { id: 'STU005', name: 'Chhin Chhat (ឈិន ឆាត)', gender: 'Male', classId: 'CLS_SW15', phone: '10/08/2005' },
            { id: 'STU006', name: 'Chhorn Sokpiseth (ឆន សុខពិសិដ្ឋ)', gender: 'Male', classId: 'CLS_SW15', phone: '25/07/2006' },
            { id: 'STU007', name: 'Choek Chanchakriya (ចើក ចាន់ចរិយា)', gender: 'Female', classId: 'CLS_SW15', phone: '07/06/2006' },
            { id: 'STU008', name: 'Choeun Cheang (ជឿន ជាង)', gender: 'Male', classId: 'CLS_SW15', phone: '15/01/2005' },
            { id: 'STU009', name: 'Chor Sarath (ជ សារ៉ាត់)', gender: 'Male', classId: 'CLS_SW15', phone: '16/01/2008' },
            { id: 'STU010', name: 'Chov Rathliza (ចូវ រដ្ឋលីហ្សា)', gender: 'Male', classId: 'CLS_SW15', phone: '15/09/2005' },
            { id: 'STU011', name: 'Eth Sokrey (អិត សុខរី)', gender: 'Male', classId: 'CLS_SW15', phone: '10/07/2006' },
            { id: 'STU012', name: 'Hen Kongpich (ហិន គង់ពេជ្រ)', gender: 'Male', classId: 'CLS_SW15', phone: '16/12/2004' },
            { id: 'STU013', name: 'Heng Kimhour (ហេង គឹមហួរ)', gender: 'Male', classId: 'CLS_SW15', phone: '27/12/2005' }
        ];

        const todayStr = getTodayDateString();
        const demoRecords = [
            { date: todayStr, studentId: 'STU001', classId: 'CLS_SW15', status: 'Present' },
            { date: todayStr, studentId: 'STU002', classId: 'CLS_SW15', status: 'Present' },
            { date: todayStr, studentId: 'STU003', classId: 'CLS_SW15', status: 'Late' },
            { date: todayStr, studentId: 'STU004', classId: 'CLS_SW15', status: 'Present' },
            { date: todayStr, studentId: 'STU005', classId: 'CLS_SW15', status: 'Present' },
            { date: todayStr, studentId: 'STU006', classId: 'CLS_SW15', status: 'Absent' },
            { date: todayStr, studentId: 'STU007', classId: 'CLS_SW15', status: 'Present' },
            { date: todayStr, studentId: 'STU008', classId: 'CLS_SW15', status: 'Present' },
            { date: todayStr, studentId: 'STU009', classId: 'CLS_SW15', status: 'Present' },
            { date: todayStr, studentId: 'STU010', classId: 'CLS_SW15', status: 'Present' },
            { date: todayStr, studentId: 'STU011', classId: 'CLS_SW15', status: 'Present' },
            { date: todayStr, studentId: 'STU012', classId: 'CLS_SW15', status: 'Present' },
            { date: todayStr, studentId: 'STU013', classId: 'CLS_SW15', status: 'Present' }
        ];

        saveClasses(demoClasses);
        saveStudents(demoStudents);
        saveAttendanceRecords(demoRecords);
    }
}

// Self-initialize default data and sync from Cloud DB on load
initializeDefaultData();
loadFromCloud();
