import CourseDetails from './CourseDetails';
import HistoricalStanding from './HistoricalStanding';

export default function CourseCard({ course, sectionMap, onProfessorClick }) {
    return <article className="course-card">
        <div className="card-top"><div><h3>{course.code}</h3><p className="course-title">{course.title}</p></div><div className="card-gpa"><strong>{course.gpa}</strong><span>Avg. GPA</span><span className="card-sample">{course.totalStudents.toLocaleString()} {course.totalStudents === 1 ? 'student' : 'students'}</span></div></div>
        <button className="professor-link" onClick={() => onProfessorClick(course.instructor)}>{course.instructor}</button>
        <p className="card-evidence">{course.semesters?.length || 0} recorded {course.semesters?.length === 1 ? 'term' : 'terms'}</p>
        <HistoricalStanding course={course} sectionMap={sectionMap} />
        <details className="card-disclosure"><summary>Grade details</summary><CourseDetails course={course} sectionMap={sectionMap} onProfessorClick={onProfessorClick} /></details>
    </article>;
}
