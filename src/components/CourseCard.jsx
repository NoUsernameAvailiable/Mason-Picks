import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import CourseDetails from './CourseDetails';
import HistoricalStanding from './HistoricalStanding';
import { calculateARate, getGradingTier, getRateMyProfessorsUrl } from '../utils/coursePresentation';

export default function CourseCard({ course, sectionMap, onProfessorClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const aRate = calculateARate(course);
    const tier = getGradingTier(course);
    const rmpUrl = getRateMyProfessorsUrl(course.instructor);

    return (
        <Motion.article
            className="course-card"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            whileHover={{ y: -6, scale: 1.015 }}
        >
            <div className="card-top">
                <div>
                    <div className="card-code-row">
                        <h3>{course.code}</h3>
                        {tier && <span className={`tier-badge ${tier.className}`}>{tier.label}</span>}
                    </div>
                    <p className="course-title">{course.title}</p>
                </div>
                <Motion.div
                    className="card-gpa"
                    whileHover={{ scale: 1.09, rotate: -1.5 }}
                    transition={{ type: "spring", stiffness: 450, damping: 18 }}
                >
                    <strong>{course.gpa}</strong>
                    <span>Avg. GPA</span>
                    {aRate !== null && <span className="a-rate-pill">{aRate}% As</span>}
                    <span className="card-sample">{course.totalStudents.toLocaleString()} {course.totalStudents === 1 ? 'student' : 'students'}</span>
                </Motion.div>
            </div>
            <div className="card-instructor-line">
                <button className="professor-link" onClick={() => onProfessorClick(course.instructor)}>{course.instructor}</button>
                {rmpUrl && (
                    <a
                        href={rmpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rmp-badge-link"
                        title={`Search ${course.instructor} on RateMyProfessors (GMU)`}
                        aria-label={`Search ${course.instructor} on RateMyProfessors`}
                    >
                        <span>RMP</span>
                        <ExternalLink size={10} aria-hidden="true" />
                    </a>
                )}
            </div>
            <p className="card-evidence">{course.semesters?.length || 0} recorded {course.semesters?.length === 1 ? 'term' : 'terms'}</p>
            <HistoricalStanding course={course} sectionMap={sectionMap} />
            <div className="card-disclosure">
                <button
                    type="button"
                    className="card-disclosure-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                >
                    <span>Grade details</span>
                    <Motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="disclosure-chevron"
                    >
                        <ChevronDown size={14} />
                    </Motion.span>
                </button>
                <AnimatePresence initial={false}>
                    {isOpen && (
                        <Motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            className="disclosure-content"
                        >
                            <CourseDetails course={course} sectionMap={sectionMap} onProfessorClick={onProfessorClick} />
                        </Motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Motion.article>
    );
}
