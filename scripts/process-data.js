import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '../FOIA_COURSES_20251030.csv');
const VERIFIED_PATH = path.join(__dirname, '../src/data/verifiedProfessors.json');
const OUTPUT_PATH = path.join(__dirname, '../public/data/courses.json');
const OUTPUT_DIR = path.dirname(OUTPUT_PATH);

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const verifiedProfessors = fs.existsSync(VERIFIED_PATH) ? JSON.parse(fs.readFileSync(VERIFIED_PATH, 'utf8')) : {};

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

function calculateMedianGPA(grades) {
    const gradeValues = [];

    for (const [grade, count] of Object.entries(grades)) {
        if (GPA_WEIGHTS[grade] !== undefined) {
            for (let i = 0; i < count; i++) {
                gradeValues.push(GPA_WEIGHTS[grade]);
            }
        }
    }

    if (gradeValues.length === 0) return 0;

    gradeValues.sort((a, b) => a - b);
    const mid = Math.floor(gradeValues.length / 2);

    if (gradeValues.length % 2 === 0) {
        return ((gradeValues[mid - 1] + gradeValues[mid]) / 2).toFixed(2);
    } else {
        return gradeValues[mid].toFixed(2);
    }
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

function getCourseLevel(courseNumber) {
    const num = parseInt(courseNumber, 10);
    if (isNaN(num)) return 'Other';
    if (num < 200) return '100';
    if (num < 300) return '200';
    if (num < 400) return '300';
    if (num < 500) return '400';
    if (num < 600) return '500';
    return '600+';
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
                    courseKey: courseId,
                    title,
                    instructor,
                    crn: crn || '',
                    level: getCourseLevel(courseNumber),
                    totalStudents: 0,
                    totalW: 0,
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
                courses[key].crn = crn;
            }

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
                    studentCount: 0,
                    wCount: 0
                };
            }

            Object.keys(courses[key].grades).forEach(grade => {
                const count = parseInt(row[grade] || 0, 10);
                courses[key].grades[grade] += count;
                courses[key].semesterData[semesterKey].grades[grade] += count;
            });

            const wCount = parseInt(row['W'] || 0, 10);
            courses[key].totalW += wCount;
            courses[key].semesterData[semesterKey].wCount += wCount;

            courses[key].totalStudents += parseInt(row['Total_Students'] || 0, 10);
            courses[key].semesterData[semesterKey].studentCount += parseInt(row['Total_Students'] || 0, 10);
            courses[key].semesters.add(semesterKey);
        });

        const instructorCounts = {};
        Object.values(courses).forEach(c => {
            const inst = c.instructor?.trim();
            if (inst && inst !== 'TBA' && inst !== 'STAFF') {
                instructorCounts[inst] = (instructorCounts[inst] || 0) + 1;
            }
        });

        const activeCourses = Object.values(courses).filter(course => {
            const inst = course.instructor?.trim();
            if (!inst || inst === 'TBA' || inst === 'STAFF') return true;
            return (instructorCounts[inst] || 0) > 1 || Boolean(verifiedProfessors[inst]);
        });

        const outputData = activeCourses
            .map(course => {
                const gpa = calculateGPA(course.grades);
                const stdDev = calculateStdDev(course.grades, parseFloat(gpa));


                const totalGraded = Object.values(course.grades).reduce((s, c) => s + c, 0);
                const withdrawRate = (totalGraded + course.totalW) > 0
                    ? ((course.totalW / (totalGraded + course.totalW)) * 100).toFixed(1)
                    : "0.0";

                const semesterDataArray = Object.values(course.semesterData)
                    .map(semData => ({
                        semester: semData.semester,
                        term: semData.term,
                        year: semData.year,
                        gpa: calculateGPA(semData.grades),
                        studentCount: semData.studentCount
                    }))
                    .sort((a, b) => {
                        if (a.year !== b.year) return a.year - b.year;
                        const termOrder = { 'Spring': 1, 'Summer': 2, 'Fall': 3, 'Winter': 4 };
                        return (termOrder[a.term] || 0) - (termOrder[b.term] || 0);
                    });

                return {
                    ...course,
                    gpa: gpa,
                    medianGpa: calculateMedianGPA(course.grades),
                    stdDev: stdDev,
                    withdrawRate: withdrawRate,
                    semesters: Array.from(course.semesters).sort(),
                    semesterData: semesterDataArray
                };
            });

        console.log(`Generated ${outputData.length} course entries.`);

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2));
        console.log(`Data written to ${OUTPUT_PATH}`);
    }
});
