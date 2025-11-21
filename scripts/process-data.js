import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '../FOIA_COURSES_20251030.csv');
const OUTPUT_PATH = path.join(__dirname, '../public/data/courses.json');
const OUTPUT_DIR = path.dirname(OUTPUT_PATH);

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const GPA_WEIGHTS = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.67,
    'B+': 3.33, 'B': 3.0, 'B-': 2.67,
    'C+': 2.33, 'C': 2.0, 'C-': 1.67,
    'D': 1.0, 'F': 0.0
};

function calculateGPA(grades) {
    let totalPoints = 0;
    let totalGradedStudents = 0;

    for (const [grade, count] of Object.entries(grades)) {
        if (GPA_WEIGHTS[grade] !== undefined) {
            totalPoints += count * GPA_WEIGHTS[grade];
            totalGradedStudents += count;
        }
    }

    return totalGradedStudents > 0 ? (totalPoints / totalGradedStudents).toFixed(2) : 0;
}

function calculateStdDev(grades, meanGPA) {
    let sumSquaredDiff = 0;
    let totalGradedStudents = 0;

    for (const [grade, count] of Object.entries(grades)) {
        if (GPA_WEIGHTS[grade] !== undefined) {
            const diff = GPA_WEIGHTS[grade] - meanGPA;
            sumSquaredDiff += count * (diff * diff);
            totalGradedStudents += count;
        }
    }

    return totalGradedStudents > 1 ? Math.sqrt(sumSquaredDiff / totalGradedStudents).toFixed(2) : 0;
}

console.log('Reading CSV file...');
const csvFile = fs.readFileSync(CSV_PATH, 'utf8');

Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
        console.log(`Parsed ${results.data.length} rows.`);

        const courses = {};

        results.data.forEach(row => {
            const subject = row['Subject']?.trim();
            const courseNumber = row['Course Number']?.trim();
            const title = row['Title']?.trim();
            let instructor = row['Instructor']?.trim();
            const crn = row['CRN']?.trim();
            const term = row['Term']?.trim();
            const year = row['Year']?.trim();

            if (!subject || !courseNumber || !term || !year) return;
            if (!instructor) instructor = 'TBA';

            const courseId = `${subject} ${courseNumber}`;
            const key = `${courseId}-${instructor}`;
            const semesterKey = `${term} ${year}`;

            if (!courses[key]) {
                courses[key] = {
                    id: key,
                    subject,
                    courseNumber,
                    code: courseId,
                    title,
                    instructor,
                    crn: crn || '',
                    totalStudents: 0,
                    grades: {
                        'A+': 0, 'A': 0, 'A-': 0,
                        'B+': 0, 'B': 0, 'B-': 0,
                        'C+': 0, 'C': 0, 'C-': 0,
                        'D': 0, 'F': 0
                    },
                    semesters: new Set(),
                    semesterData: {}
                };
            } else if (crn && !courses[key].crn) {
                // Update CRN if it exists and wasn't set before
                courses[key].crn = crn;
            }

            // Initialize semester data if not exists
            if (!courses[key].semesterData[semesterKey]) {
                courses[key].semesterData[semesterKey] = {
                    semester: semesterKey,
                    term: term,
                    year: parseInt(year, 10),
                    grades: {
                        'A+': 0, 'A': 0, 'A-': 0,
                        'B+': 0, 'B': 0, 'B-': 0,
                        'C+': 0, 'C': 0, 'C-': 0,
                        'D': 0, 'F': 0
                    },
                    studentCount: 0
                };
            }

            // Aggregate grades for overall
            Object.keys(courses[key].grades).forEach(grade => {
                const count = parseInt(row[grade] || 0, 10);
                courses[key].grades[grade] += count;
                courses[key].semesterData[semesterKey].grades[grade] += count;
            });

            courses[key].totalStudents += parseInt(row['Total_Students'] || 0, 10);
            courses[key].semesterData[semesterKey].studentCount += parseInt(row['Total_Students'] || 0, 10);
            courses[key].semesters.add(semesterKey);
        });

        // Calculate GPA and format output
        const outputData = Object.values(courses)
            .filter(course => course.totalStudents >= 5)
            .map(course => {
                const gpa = calculateGPA(course.grades);
                const stdDev = calculateStdDev(course.grades, parseFloat(gpa));

                // Calculate GPA for each semester and sort chronologically
                const semesterDataArray = Object.values(course.semesterData)
                    .map(semData => ({
                        semester: semData.semester,
                        term: semData.term,
                        year: semData.year,
                        gpa: calculateGPA(semData.grades),
                        studentCount: semData.studentCount
                    }))
                    .sort((a, b) => {
                        // Sort by year first, then by term order
                        if (a.year !== b.year) return a.year - b.year;
                        const termOrder = { 'Spring': 1, 'Summer': 2, 'Fall': 3, 'Winter': 4 };
                        return (termOrder[a.term] || 0) - (termOrder[b.term] || 0);
                    });

                return {
                    ...course,
                    gpa: gpa,
                    stdDev: stdDev,
                    semesters: Array.from(course.semesters).sort(),
                    semesterData: semesterDataArray
                };
            });

        // Deduplicate: Remove courses with same Code + GPA + TotalStudents
        const seenSignatures = new Set();
        const uniqueOutputData = outputData.filter(course => {
            const signature = `${course.code}|${course.gpa}|${course.totalStudents}`;
            if (seenSignatures.has(signature)) {
                return false;
            }
            seenSignatures.add(signature);
            return true;
        });

        console.log(`Generated ${uniqueOutputData.length} unique course entries (from ${outputData.length} total).`);

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(uniqueOutputData, null, 2));
        console.log(`Data written to ${OUTPUT_PATH}`);
    }
});
