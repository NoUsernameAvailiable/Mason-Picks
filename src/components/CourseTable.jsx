import { Fragment, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown } from 'lucide-react';
import CourseDetails from './CourseDetails';
import HistoricalStanding from './HistoricalStanding';

export default function CourseTable({ courses, sortConfig, onSort, onProfessorClick, sectionMap }) {
    const [expandedId, setExpandedId] = useState(null);
    const columns = [{key:'code', label:'Course'}, {key:'instructor', label:'Instructor'}, {key:'gpa', label:'Avg. GPA'}, {key:'totalStudents', label:'Students'}];
    return <div className="course-list"><table><caption className="sr-only">Historical course and instructor grade averages</caption><thead><tr>{columns.map(col => <th key={col.key} scope="col" aria-sort={sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}><button onClick={() => onSort(col.key)}>{col.label}{sortConfig.key === col.key && (sortConfig.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}</button></th>)}<th scope="col"><span className="sr-only">Grade details</span></th></tr></thead><tbody>{courses.map(course => {
        const open = expandedId === course.id;
        return <Fragment key={course.id}><tr className={`course-row ${open ? 'expanded' : ''}`}><td className="course-identity"><strong>{course.code}</strong><span className="course-title">{course.title}</span><HistoricalStanding course={course} sectionMap={sectionMap} /></td><td className="instructor-cell"><button className="professor-link" onClick={() => onProfessorClick(course.instructor)}>{course.instructor}</button></td><td className="gpa-cell"><strong>{course.gpa}</strong><span className="mobile-only">Avg. GPA</span></td><td className="students-cell">{course.totalStudents.toLocaleString()}<span className="mobile-only"> {course.totalStudents === 1 ? 'student' : 'students'}</span></td><td className="details-cell"><button className="details-button" aria-expanded={open} aria-controls={`details-${course.id}`} aria-label={`Grade details for ${course.code}, ${course.instructor}`} onClick={() => setExpandedId(open ? null : course.id)}><span>Grade details</span><ChevronDown size={16} className={open ? 'rotate-180' : ''} /></button></td></tr>{open && <tr className="detail-row" id={`details-${course.id}`}><td colSpan={5}><CourseDetails course={course} sectionMap={sectionMap} onProfessorClick={onProfessorClick} /></td></tr>}</Fragment>;
    })}</tbody></table></div>;
}
