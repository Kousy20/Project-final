-- -----------------------------------------------------------------------------
-- 1. classes
-- Stores metadata about the school classes/sections.
-- -----------------------------------------------------------------------------
CREATE TABLE classes (
    id VARCHAR(50) PRIMARY KEY,               -- e.g., 'CLS001', 'CLS002'
    name VARCHAR(100) NOT NULL,               -- e.g., 'Class 10-A'
    teacher VARCHAR(100) NOT NULL,            -- Name of the assigned teacher
    schedule VARCHAR(100) NOT NULL,           -- e.g., 'Mon-Wed 09:00 AM'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. students
-- Stores information about students. Each student belongs to exactly one class.
-- -----------------------------------------------------------------------------
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,               -- e.g., 'STU001', 'STU002'
    name VARCHAR(100) NOT NULL,               -- Full name of the student
    gender VARCHAR(20) NOT NULL,              -- e.g., 'Male', 'Female', 'Other'
    class_id VARCHAR(50) NOT NULL,            -- Foreign key linking to classes
    phone VARCHAR(20) NULL,                   -- Optional contact number
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 3. attendance_records
-- Records the attendance status for a student in their class on a specific date.
-- -----------------------------------------------------------------------------
CREATE TABLE attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- Unique surrogate key
    date DATE NOT NULL,                        -- Date of attendance record (YYYY-MM-DD)
    student_id VARCHAR(50) NOT NULL,          -- Foreign key linking to students
    class_id VARCHAR(50) NOT NULL,            -- Foreign key linking to classes
    status VARCHAR(20) NOT NULL,              -- Must be 'Present', 'Late', or 'Absent'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure status is valid
    CONSTRAINT chk_attendance_status CHECK (status IN ('Present', 'Late', 'Absent')),
    
    -- Foreign keys
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    
    -- Unique constraint: A student can only have one attendance record per class per day
    CONSTRAINT uq_date_student_class UNIQUE (date, student_id, class_id)
);

CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_class ON attendance_records(class_id);
