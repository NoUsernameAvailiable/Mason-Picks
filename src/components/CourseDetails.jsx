import GpaTrend from './GpaTrend';
import { historicalStanding, chronologicalTerms } from '../utils/coursePresentation';

const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

export default function CourseDetails({ course, sectionMap, onProfessorClick }) {
    const total = grades.reduce((sum, grade) => sum + (course.grades?.[grade] || 0), 0);
    const peers = [...(sectionMap?.get(course.courseKey) || [])].sort((a, b) => Number(b.gpa) - Number(a.gpa));
    return <div className="course-details">
        <div><h4>Grade distribution</h4><div className="grade-chart">{grades.map(grade => {
            const count = course.grades?.[grade] || 0;
            const percentage = total ? count / total * 100 : 0;
            return <div className="grade-column" role="img" aria-label={`${grade}: ${count} students, ${percentage.toFixed(1)} percent`} key={grade} title={`${grade}: ${count} students (${percentage.toFixed(1)}%)`}><span className="grade-value">{Math.round(percentage)}%</span><div className="grade-track"><div style={{ height: `${percentage}%`, '--grade-share': `${percentage}%` }} /></div><span className="grade-label">{grade}</span></div>;
        })}</div><p className="detail-note">Share of {total.toLocaleString()} letter grades. Withdrawals and incompletes excluded.</p></div>
        <div className="detail-facts"><h4>Behind the average</h4><dl><div><dt>Median GPA</dt><dd>{course.medianGpa}</dd></div><div><dt>Standard deviation</dt><dd>{course.stdDev ?? 'Not available'}</dd></div><div><dt>Withdrawal rate</dt><dd>{course.withdrawRate != null ? `${course.withdrawRate}%` : 'Not available'}</dd></div></dl><p className="detail-note">Recorded terms: {chronologicalTerms(course.semesterData).map(term => term.semester).join(', ') || course.semesters?.join(', ') || 'Not available'}</p></div>
        <GpaTrend course={course} />
        {peers.length > 1 && <div className="peer-comparison"><h4>Compare instructors · {course.code}</h4><div className="peer-list">{peers.map(peer => <div key={peer.id}><button className="professor-link" onClick={() => onProfessorClick(peer.instructor)}>{peer.instructor}</button>{historicalStanding(peer, peers) && <span className="peer-standing">{historicalStanding(peer, peers)}</span>}<span>{peer.gpa} GPA <small>· {peer.totalStudents.toLocaleString()} students</small></span></div>)}</div></div>}
    </div>;
}
