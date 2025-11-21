import React, { useState, useEffect, useRef } from 'react';

export default function CourseCard({ course }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState('bottom');
    const tooltipRef = useRef(null);
    const buttonRef = useRef(null);

    const gpaColor = (gpa) => {
        const num = parseFloat(gpa);
        if (num >= 3.5) return 'text-green-600';
        if (num >= 3.0) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Calculate percentage distribution
    const totalGraded = Object.entries(course.grades || {})
        .filter(([grade]) => grade !== 'W' && grade !== 'IN')
        .reduce((sum, [, count]) => sum + count, 0);

    const getPercentage = (count) => totalGraded > 0 ? ((count / totalGraded) * 100).toFixed(1) : 0;

    // Grade distribution data for visualization (F on left, A+ on right)
    const gradeData = course.grades ? [
        { label: 'F', count: course.grades['F'] || 0, color: 'bg-red-600' },
        { label: 'D', count: course.grades['D'] || 0, color: 'bg-red-400' },
        { label: 'C-', count: course.grades['C-'] || 0, color: 'bg-orange-200' },
        { label: 'C', count: course.grades['C'] || 0, color: 'bg-orange-300' },
        { label: 'C+', count: course.grades['C+'] || 0, color: 'bg-orange-400' },
        { label: 'B-', count: course.grades['B-'] || 0, color: 'bg-yellow-200' },
        { label: 'B', count: course.grades['B'] || 0, color: 'bg-yellow-300' },
        { label: 'B+', count: course.grades['B+'] || 0, color: 'bg-yellow-400' },
        { label: 'A-', count: course.grades['A-'] || 0, color: 'bg-green-300' },
        { label: 'A', count: course.grades['A'] || 0, color: 'bg-green-400' },
        { label: 'A+', count: course.grades['A+'] || 0, color: 'bg-green-500' },
    ] : [];

    const maxCount = Math.max(...gradeData.map(g => g.count), 1);

    // Calculate Y-axis labels
    const yAxisSteps = 4;
    const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) =>
        Math.round((maxCount / yAxisSteps) * (yAxisSteps - i))
    );

    // Handle click outside to close pinned tooltip
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isPinned &&
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)) {
                setIsPinned(false);
                setShowTooltip(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPinned]);

    const handleMoreClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newPinned = !isPinned;
        setIsPinned(newPinned);
        setShowTooltip(true); // Always show when clicked
        checkTooltipPosition();
    };

    const handleMouseEnter = () => {
        if (!isPinned) {
            setShowTooltip(true);
            checkTooltipPosition();
        }
    };

    const checkTooltipPosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // If less than 600px space below, show tooltip above
            setTooltipPosition(spaceBelow < 600 ? 'top' : 'bottom');
        }
    };

    const handleMouseLeave = () => {
        if (!isPinned) {
            setShowTooltip(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{course.code}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1" title={course.title}>{course.title}</p>
                    {course.crn && <p className="text-xs text-gray-500 mt-1">CRN: {course.crn}</p>}
                </div>
                <div className="text-right relative">
                    <div className="flex items-center justify-end gap-2">
                        <div className={`text-xl font-bold ${gpaColor(course.gpa)}`}>
                            {course.gpa}
                        </div>
                        {/* Sparkline */}
                        {course.semesterData && course.semesterData.length > 1 && (
                            <svg width="40" height="20" viewBox="0 0 40 20" className="opacity-60">
                                <polyline
                                    points={course.semesterData.map((sem, idx) => {
                                        const x = (idx * 40) / (course.semesterData.length - 1);
                                        const minGPA = Math.min(...course.semesterData.map(s => parseFloat(s.gpa)));
                                        const maxGPA = Math.max(...course.semesterData.map(s => parseFloat(s.gpa)));
                                        const range = maxGPA - minGPA || 1;
                                        const y = 18 - ((parseFloat(sem.gpa) - minGPA) / range) * 16;
                                        return `${x},${y}`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={gpaColor(course.gpa)}
                                />
                            </svg>
                        )}
                    </div>
                    <button
                        ref={buttonRef}
                        className={`text-xs italic cursor-pointer mt-1 transition-colors ${
                            isPinned ? 'text-blue-400 hover:text-blue-500' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        onClick={handleMoreClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        more
                    </button>

                    {showTooltip && (
                        <div
                            ref={tooltipRef}
                            className={`absolute right-0 w-72 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-4 z-10 ${
                                tooltipPosition === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
                            }`}>
                            <div className="font-semibold mb-3 text-sm">Grade Distribution</div>

                            {/* Bell Curve Visualization */}
                            <div className="mb-3 bg-gray-800 rounded p-3">
                                <div className="flex">
                                    {/* Y-axis labels */}
                                    <div className="flex flex-col justify-between h-24 pr-2 text-[9px] text-gray-400">
                                        {yAxisLabels.map((label, idx) => (
                                            <div key={idx} className="leading-none">{label}</div>
                                        ))}
                                    </div>

                                    {/* Chart area */}
                                    <div className="flex-1">
                                        <svg width="100%" height="100" viewBox="0 0 240 100" preserveAspectRatio="none" className="overflow-visible">
                                            {/* Grid lines */}
                                            <line x1="0" y1="80" x2="240" y2="80" stroke="#374151" strokeWidth="1" strokeDasharray="2,2" />
                                            <line x1="0" y1="60" x2="240" y2="60" stroke="#374151" strokeWidth="1" strokeDasharray="2,2" />
                                            <line x1="0" y1="40" x2="240" y2="40" stroke="#374151" strokeWidth="1" strokeDasharray="2,2" />
                                            <line x1="0" y1="20" x2="240" y2="20" stroke="#374151" strokeWidth="1" strokeDasharray="2,2" />

                                            {/* Y-axis line */}
                                            <line x1="0" y1="0" x2="0" y2="85" stroke="#4B5563" strokeWidth="2" />

                                            {/* Bell curve line */}
                                            <polyline
                                                points={gradeData.map((grade, idx) => {
                                                    const x = (idx * 240) / (gradeData.length - 1);
                                                    const y = 85 - ((grade.count / maxCount) * 70);
                                                    return `${x},${y}`;
                                                }).join(' ')}
                                                fill="none"
                                                stroke="#3b82f6"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />

                                            {/* Filled area under curve */}
                                            <polygon
                                                points={`0,85 ${gradeData.map((grade, idx) => {
                                                    const x = (idx * 240) / (gradeData.length - 1);
                                                    const y = 85 - ((grade.count / maxCount) * 70);
                                                    return `${x},${y}`;
                                                }).join(' ')} 240,85`}
                                                fill="url(#gradient)"
                                                opacity="0.3"
                                            />

                                            {/* Gradient definition */}
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                                                </linearGradient>
                                            </defs>

                                            {/* Data points */}
                                            {gradeData.map((grade, idx) => {
                                                const x = (idx * 240) / (gradeData.length - 1);
                                                const y = 85 - ((grade.count / maxCount) * 70);
                                                const percentage = getPercentage(grade.count);
                                                return (
                                                    <g key={idx}>
                                                        <circle
                                                            cx={x}
                                                            cy={y}
                                                            r="4"
                                                            fill="#3b82f6"
                                                            stroke="#1e40af"
                                                            strokeWidth="1.5"
                                                        />
                                                        <title>{`${grade.label}: ${grade.count} students (${percentage}%)`}</title>
                                                    </g>
                                                );
                                            })}
                                        </svg>

                                        {/* Grade labels */}
                                        <div className="flex justify-between mt-1 px-1">
                                            {gradeData.map((grade, idx) => (
                                                <div key={idx} className="text-[9px] text-gray-400 text-center" style={{ width: '9%' }}>
                                                    {grade.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* GPA Trend Over Time */}
                            {course.semesterData && course.semesterData.length > 1 && (
                                <div className="mb-3 bg-gray-800 rounded p-3">
                                    <div className="font-semibold mb-2 text-[11px]">Avg. GPA Trend Over Time</div>
                                    <div className="flex">
                                        {/* Y-axis labels for trend */}
                                        <div className="flex flex-col justify-between h-20 pr-2 text-[9px] text-gray-400">
                                            {(() => {
                                                const gpas = course.semesterData.map(s => parseFloat(s.gpa));
                                                const minGPA = Math.min(...gpas);
                                                const maxGPA = Math.max(...gpas);
                                                const range = maxGPA - minGPA;

                                                // If all GPAs are the same, show range around that value
                                                if (range === 0) {
                                                    const gpa = maxGPA;
                                                    // Show reasonable range, but cap at 4.0
                                                    const topLabel = Math.min(gpa + 0.3, 4.0);
                                                    const range = topLabel - Math.max(gpa - 0.3, 0);
                                                    const step = range / 3;
                                                    return [
                                                        topLabel.toFixed(2),
                                                        (topLabel - step).toFixed(2),
                                                        (topLabel - 2 * step).toFixed(2),
                                                        Math.max(gpa - 0.3, 0).toFixed(2)
                                                    ].map((val, idx) => <div key={idx} className="leading-none">{val}</div>);
                                                }

                                                const step = range / 3;
                                                return [
                                                    maxGPA.toFixed(2),
                                                    (maxGPA - step).toFixed(2),
                                                    (maxGPA - 2 * step).toFixed(2),
                                                    minGPA.toFixed(2)
                                                ].map((val, idx) => <div key={idx} className="leading-none">{val}</div>);
                                            })()}
                                        </div>

                                        {/* Trend chart */}
                                        <div className="flex-1">
                                            <svg width="100%" height="80" viewBox="0 0 240 80" preserveAspectRatio="none">
                                                {/* Grid lines */}
                                                <line x1="0" y1="60" x2="240" y2="60" stroke="#374151" strokeWidth="1" strokeDasharray="2,2" />
                                                <line x1="0" y1="40" x2="240" y2="40" stroke="#374151" strokeWidth="1" strokeDasharray="2,2" />
                                                <line x1="0" y1="20" x2="240" y2="20" stroke="#374151" strokeWidth="1" strokeDasharray="2,2" />

                                                {/* Y-axis line */}
                                                <line x1="0" y1="0" x2="0" y2="75" stroke="#4B5563" strokeWidth="2" />

                                                {/* Trend line */}
                                                <polyline
                                                    points={course.semesterData.map((sem, idx) => {
                                                        const x = (idx * 240) / (course.semesterData.length - 1);
                                                        const minGPA = Math.min(...course.semesterData.map(s => parseFloat(s.gpa)));
                                                        const maxGPA = Math.max(...course.semesterData.map(s => parseFloat(s.gpa)));
                                                        const range = maxGPA - minGPA;
                                                        // If all GPAs are the same, center the line
                                                        const y = range === 0 ? 40 : 70 - ((parseFloat(sem.gpa) - minGPA) / range) * 60;
                                                        return `${x},${y}`;
                                                    }).join(' ')}
                                                    fill="none"
                                                    stroke="#10b981"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />

                                                {/* Data points */}
                                                {course.semesterData.map((sem, idx) => {
                                                    const x = (idx * 240) / (course.semesterData.length - 1);
                                                    const minGPA = Math.min(...course.semesterData.map(s => parseFloat(s.gpa)));
                                                    const maxGPA = Math.max(...course.semesterData.map(s => parseFloat(s.gpa)));
                                                    const range = maxGPA - minGPA;
                                                    const y = range === 0 ? 40 : 70 - ((parseFloat(sem.gpa) - minGPA) / range) * 60;
                                                    return (
                                                        <g key={idx}>
                                                            <circle
                                                                cx={x}
                                                                cy={y}
                                                                r="4"
                                                                fill="#10b981"
                                                                stroke="#059669"
                                                                strokeWidth="1.5"
                                                            />
                                                            <title>{`${sem.semester}: GPA ${sem.gpa} (${sem.studentCount} students)`}</title>
                                                        </g>
                                                    );
                                                })}
                                            </svg>

                                            {/* Semester labels - show only some to avoid crowding */}
                                            <div className="flex justify-between mt-1 text-[8px] text-gray-400">
                                                {course.semesterData.map((sem, idx, arr) => {
                                                    // Show first, last, and middle labels for clarity
                                                    const shouldShow = idx === 0 || idx === arr.length - 1 || (arr.length > 4 && idx === Math.floor(arr.length / 2));
                                                    return (
                                                        <div key={idx} className="flex-1 text-center" style={{ visibility: shouldShow ? 'visible' : 'hidden' }}>
                                                            {sem.term.substring(0, 3)} {sem.year.toString().substring(2)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Statistics */}
                            <div className="space-y-1 border-t border-gray-700 pt-2">
                                {course.stdDev && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Std. Deviation:</span>
                                        <span className="font-medium">{course.stdDev}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Graded:</span>
                                    <span className="font-medium">{totalGraded}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Mean GPA:</span>
                                    <span className={`font-medium ${gpaColor(course.gpa).replace('text-', 'text-')}`}>
                                        {course.gpa}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span className="font-medium truncate max-w-[60%]">{course.instructor}</span>
                <span>{course.totalStudents} students</span>
            </div>
        </div>
    );
}
