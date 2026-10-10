import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion as Motion } from 'motion/react';
import { X, ArrowDown, ArrowUp, ExternalLink } from 'lucide-react';
import { calculateARate, getRateMyProfessorsUrl } from '../utils/coursePresentation';

export default function ProfessorModal({ professor, courses, onClose }) {
    const dialogRef = useRef(null);
    useEffect(() => {
        const previous = document.activeElement;
        const dialog = dialogRef.current;
        const scroll = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog?.querySelector('button')?.focus();
        const trap = (event) => {
            if (event.key !== 'Tab') return;
            const items = dialog?.querySelectorAll('button, [href], select, input, [tabindex="0"]') || [];
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        };
        dialog?.addEventListener('keydown', trap);
        return () => { dialog?.removeEventListener('keydown', trap); document.body.style.overflow = scroll; previous?.focus(); };
    }, []);
    const [sortKey, setSortKey] = useState('gpa');
    const [sortDir, setSortDir] = useState('desc');
    const rmpUrl = getRateMyProfessorsUrl(professor);

    const profCourses = useMemo(() => {
        return courses.filter(c => c.instructor === professor);
    }, [courses, professor]);

    const sortedCourses = useMemo(() => {
        const withRate = profCourses.map(c => ({
            ...c,
            aRate: calculateARate(c)
        }));
        return withRate.sort((a, b) => {
            let aVal = a[sortKey];
            let bVal = b[sortKey];
            if (['gpa', 'medianGpa', 'totalStudents', 'aRate'].includes(sortKey)) {
                aVal = aVal != null ? parseFloat(aVal) : -1;
                bVal = bVal != null ? parseFloat(bVal) : -1;
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
        const totalLetters = profCourses.reduce((sum, c) => {
            const g = c.grades || {};
            return sum + ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'].reduce((s, k) => s + (g[k] || 0), 0);
        }, 0);
        const totalAs = profCourses.reduce((sum, c) => {
            const g = c.grades || {};
            return sum + (g['A+'] || 0) + (g['A'] || 0) + (g['A-'] || 0);
        }, 0);
        const overallARate = totalLetters > 0 ? Math.round((totalAs / totalLetters) * 100) : null;
        return { totalStudents, avgGpa, uniqueCourses, totalSections: profCourses.length, overallARate };
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
        { key: 'aRate', label: 'A-Rate' },
        { key: 'medianGpa', label: 'Median' },
        { key: 'totalStudents', label: 'Students' },
    ];

    return (
        <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="profile-backdrop"
            onClick={onClose}
        >
            <Motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="professor-heading"
                className="professor-profile"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                onClick={event => event.stopPropagation()}
            >
                <div className="profile-header">
                    <div>
                        <p className="eyebrow">INSTRUCTOR RECORD</p>
                        <div className="profile-heading-group">
                            <h2 id="professor-heading">{professor}</h2>
                            {rmpUrl && (
                                <a
                                    href={rmpUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rmp-profile-btn"
                                    title={`View ${professor} on RateMyProfessors`}
                                >
                                    <span>RateMyProfessors</span>
                                    <ExternalLink size={13} aria-hidden="true" />
                                </a>
                            )}
                        </div>
                    </div>
                    <button className="icon-button" onClick={onClose} aria-label="Close professor profile"><X size={20} /></button>
                </div>
                <dl className="profile-stats">
                    <Motion.div
                        className="profile-stat-box"
                        initial={{ opacity: 0, y: 16, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 360, damping: 22, delay: 0.05 }}
                    >
                        <dt>Average across courses</dt><dd>{stats.avgGpa}<small> GPA</small></dd>
                    </Motion.div>
                    <Motion.div
                        className="profile-stat-box"
                        initial={{ opacity: 0, y: 16, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 360, damping: 22, delay: 0.1 }}
                    >
                        <dt>Overall A-grade rate</dt><dd>{stats.overallARate !== null ? `${stats.overallARate}%` : 'N/A'}<small> As</small></dd>
                    </Motion.div>
                    <Motion.div
                        className="profile-stat-box"
                        initial={{ opacity: 0, y: 16, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 360, damping: 22, delay: 0.15 }}
                    >
                        <dt>Courses</dt><dd>{stats.uniqueCourses}</dd>
                    </Motion.div>
                    <Motion.div
                        className="profile-stat-box"
                        initial={{ opacity: 0, y: 16, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 360, damping: 22, delay: 0.2 }}
                    >
                        <dt>Student records</dt><dd>{stats.totalStudents.toLocaleString()}</dd>
                    </Motion.div>
                </dl>
                <p className="profile-note">Each course counts equally in this average. Student records may include the same person in different courses.</p>
                <div className="profile-scroll" tabIndex={0} role="region" aria-label="Instructor course records">
                    <table className="profile-table"><caption className="sr-only">Historical grade averages for {professor}</caption>
                        <thead><tr>{columns.map(column => <th key={column.key} scope="col" aria-sort={sortKey === column.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}><button onClick={() => handleSort(column.key)}>{column.label}{sortKey === column.key && (sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}</button></th>)}</tr></thead>
                        <tbody>{sortedCourses.map(course => <tr key={course.id}><td><strong>{course.code}</strong><span>{course.title}</span></td><td>{course.gpa}</td><td>{course.aRate !== null ? <span className="modal-a-rate-pill">{course.aRate}%</span> : '—'}</td><td>{course.medianGpa}</td><td>{course.totalStudents.toLocaleString()}</td></tr>)}</tbody>
                    </table>
                </div>
                <div className="profile-footer">Historical grades · Not a rating of teaching quality</div>
            </Motion.div>
        </Motion.div>
    );
}
