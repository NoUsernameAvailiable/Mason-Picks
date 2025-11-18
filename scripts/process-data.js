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

            if (!subject || !courseNumber) return;
            if (!instructor) instructor = 'TBA';

            const courseId = `${subject} ${courseNumber}`;
            const key = `${courseId}-${instructor}`;

            if (!courses[key]) {
                courses[key] = {
                    id: key,
                    subject,
                    courseNumber,
                    code: courseId,
                    title,
                    instructor,
                    totalStudents: 0,
                    grades: {
                        'A+': 0, 'A': 0, 'A-': 0,
                        'B+': 0, 'B': 0, 'B-': 0,
                        'C+': 0, 'C': 0, 'C-': 0,
                        'D': 0, 'F': 0
                    },
                    semesters: new Set()
                };
            }

            // Aggregate grades
            Object.keys(courses[key].grades).forEach(grade => {
                const count = parseInt(row[grade] || 0, 10);
                courses[key].grades[grade] += count;
            });

            courses[key].totalStudents += parseInt(row['Total_Students'] || 0, 10);
            courses[key].semesters.add(`${row['Term']} ${row['Year']}`);
        });

        // Calculate GPA and format output
        const outputData = Object.values(courses)
            .filter(course => course.totalStudents >= 5)
            .map(course => {
                return {
                    ...course,
                    gpa: calculateGPA(course.grades),
                    semesters: Array.from(course.semesters).sort()
                };
            });

        console.log(`Generated ${outputData.length} course entries.`);

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2));
        console.log(`Data written to ${OUTPUT_PATH}`);
    }
});
