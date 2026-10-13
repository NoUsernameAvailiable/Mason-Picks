import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import CourseDetails from './CourseDetails';
import HistoricalStanding from './HistoricalStanding';
import InstructorBadge from './InstructorBadge';
import Badge from './Badge';
import { calculateARate, getGradingTier } from '../utils/coursePresentation';

export default function CourseCard({ course, sectionMap, onProfessorClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const aRate = calculateARate(course);
    const tier = getGradingTier(course);

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
                        {aRate !== null ? (
                            <Badge>
                                {aRate}% As
                            </Badge>
                        ) : tier ? (
                            <Badge>
                                {tier.label}
                            </Badge>
                        ) : null}
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
                    <span className="card-sample">{course.totalStudents.toLocaleString()} {course.totalStudents === 1 ? 'student' : 'students'}</span>
                </Motion.div>
            </div>
            <InstructorBadge
                instructor={course.instructor}
                onProfessorClick={onProfessorClick}
                className="card-instructor-line"
            />

            <p className="card-evidence">{course.semesters?.length || 0} recorded {course.semesters?.length === 1 ? 'term' : 'terms'}</p>
            <div className="card-standing-slot">
                <HistoricalStanding course={course} sectionMap={sectionMap} />
            </div>
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
