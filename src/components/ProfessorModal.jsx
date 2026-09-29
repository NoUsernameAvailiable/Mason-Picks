import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, ArrowDown, ArrowUp } from 'lucide-react';

export default function ProfessorModal({ professor, courses, onClose }) {
    const dialogRef = useRef(null);
    useEffect(() => {
        const previous = document.activeElement;
        const dialog = dialogRef.current;
        const scroll = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.querySelector('button')?.focus();
        const trap = (event) => {
            if (event.key !== 'Tab') return;
            const items = dialog.querySelectorAll('button, [href], select, input, [tabindex="0"]');
            const first = items[0]; const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        };
        dialog.addEventListener('keydown', trap);
        return () => { dialog.removeEventListener('keydown', trap); document.body.style.overflow = scroll; previous?.focus(); };
    }, []);
    const [sortKey, setSortKey] = useState('gpa');
    const [sortDir, setSortDir] = useState('desc');

    const profCourses = useMemo(() => {
        return courses.filter(c => c.instructor === professor);
    }, [courses, professor]);

    const sortedCourses = useMemo(() => {
        return [...profCourses].sort((a, b) => {
            let aVal = a[sortKey];
            let bVal = b[sortKey];
            if (['gpa', 'medianGpa', 'totalStudents'].includes(sortKey)) {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            } else {
                aVal = (aVal || '').toString().toLowerCase();
                bVal = (bVal || '').toString().toLowerCase();
            }
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [profCourses, sortKey, sortDir]);

    const stats = useMemo(() => {
        const totalStudents = profCourses.reduce((s, c) => s + c.totalStudents, 0);
        const avgGpa = profCourses.length > 0
            ? (profCourses.reduce((s, c) => s + parseFloat(c.gpa), 0) / profCourses.length).toFixed(2)
            : '0.00';
        const uniqueCourses = new Set(profCourses.map(c => c.courseKey)).size;
        return { totalStudents, avgGpa, uniqueCourses, totalSections: profCourses.length };
    }, [profCourses]);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const columns = [
        { key: 'code', label: 'Course' },
        { key: 'gpa', label: 'Avg. GPA' },
        { key: 'medianGpa', label: 'Median' },
        { key: 'totalStudents', label: 'Students' },
    ];

    return (
        <div className="profile-backdrop" onClick={onClose}>
            <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="professor-heading" className="professor-profile animate-modal-in" onClick={event => event.stopPropagation()}>
                <div className="profile-header">
                    <div><p className="eyebrow">INSTRUCTOR RECORD</p><h2 id="professor-heading">{professor}</h2></div>
                    <button className="icon-button" onClick={onClose} aria-label="Close professor profile"><X size={20} /></button>
                </div>
                <dl className="profile-stats">
                    <div><dt>Average across courses</dt><dd>{stats.avgGpa}<small> GPA</small></dd></div>
                    <div><dt>Courses</dt><dd>{stats.uniqueCourses}</dd></div>
                    <div><dt>Student records</dt><dd>{stats.totalStudents.toLocaleString()}</dd></div>
                </dl>
                <p className="profile-note">Each course counts equally in this average. Student records may include the same person in different courses.</p>
                <div className="profile-scroll" tabIndex={0} role="region" aria-label="Instructor course records">
                    <table className="profile-table"><caption className="sr-only">Historical grade averages for {professor}</caption>
                        <thead><tr>{columns.map(column => <th key={column.key} scope="col" aria-sort={sortKey === column.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}><button onClick={() => handleSort(column.key)}>{column.label}{sortKey === column.key && (sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}</button></th>)}</tr></thead>
                        <tbody>{sortedCourses.map(course => <tr key={course.id}><td><strong>{course.code}</strong><span>{course.title}</span></td><td>{course.gpa}</td><td>{course.medianGpa}</td><td>{course.totalStudents.toLocaleString()}</td></tr>)}</tbody>
                    </table>
                </div>
                <div className="profile-footer">Historical grades · Not a rating of teaching quality</div>
            </div>
        </div>
    );
}
