import React, { useState } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

export default function CourseTable({ courses, sortConfig, onSort }) {
    const [expandedId, setExpandedId] = useState(null);

    const gpaColor = (gpa) => {
        const num = parseFloat(gpa);
        if (num >= 3.5) return 'text-emerald-500 dark:text-emerald-400';
        if (num >= 3.0) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const wColor = (w) => {
        const num = parseFloat(w);
        if (num < 5) return 'text-emerald-500 dark:text-emerald-400';
        if (num <= 15) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const columns = [
        { key: 'code', label: 'Course', className: '' },
        { key: 'title', label: 'Title', className: 'hidden md:table-cell' },
        { key: 'instructor', label: 'Instructor', className: '' },
        { key: 'gpa', label: 'Mean GPA', className: '' },
        { key: 'medianGpa', label: 'Median', className: 'hidden lg:table-cell' },
        { key: 'withdrawRate', label: 'W%', className: 'hidden sm:table-cell' },
        { key: 'totalStudents', label: 'Students', className: 'hidden sm:table-cell' },
    ];

    const toggleExpand = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    // Grade distribution 
    const gradeLabels = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        {columns.map(col => (
                            <th
                                key={col.key}
                                className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors select-none ${col.className}`}
                                onClick={() => onSort(col.key)}
                            >
                                <span className="flex items-center gap-1">
                                    {col.label}
                                    {sortConfig.key === col.key && (
                                        <ArrowUpDown size={12} className={`text-mason-green dark:text-mason-gold ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                                    )}
                                </span>
                            </th>
                        ))}
                        <th className="px-4 py-3 w-8"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {courses.map((course, idx) => (
                        <React.Fragment key={course.id}>
                            <tr
                                className={`cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'} hover:bg-mason-green/5 dark:hover:bg-mason-green/10`}
                                onClick={() => toggleExpand(course.id)}
                            >
                                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                    {course.code}
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[200px] truncate hidden md:table-cell" title={course.title}>
                                    {course.title}
                                </td>
                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[150px] truncate" title={course.instructor}>
                                    {course.instructor}
                                </td>
                                <td className={`px-4 py-3 font-bold ${gpaColor(course.gpa)}`}>
                                    {course.gpa}
                                </td>
                                <td className={`px-4 py-3 font-semibold hidden lg:table-cell ${gpaColor(course.medianGpa)}`}>
                                    {course.medianGpa}
                                </td>
                                <td className={`px-4 py-3 hidden sm:table-cell ${wColor(course.withdrawRate)}`}>
                                    {course.withdrawRate}%
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                                    {course.totalStudents}
                                </td>
                                <td className="px-4 py-3 text-gray-400">
                                    {expandedId === course.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </td>
                            </tr>

                            {expandedId === course.id && (
                                <tr className="bg-gray-50 dark:bg-gray-900/50">
                                    <td colSpan={columns.length + 1} className="px-6 py-4">
                                        <div className="flex flex-wrap gap-6">
                                            <div>
                                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                                    Grade Distribution
                                                </div>
                                                <div className="flex items-end gap-1 h-16">
                                                    {gradeLabels.map(grade => {
                                                        const count = course.grades?.[grade] || 0;
                                                        const total = Object.values(course.grades || {}).reduce((s, c) => s + c, 0);
                                                        const pct = total > 0 ? (count / total) * 100 : 0;
                                                        const gradeColors = {
                                                            'A+': 'bg-emerald-500', 'A': 'bg-emerald-400', 'A-': 'bg-emerald-300',
                                                            'B+': 'bg-yellow-400', 'B': 'bg-yellow-300', 'B-': 'bg-yellow-200',
                                                            'C+': 'bg-orange-400', 'C': 'bg-orange-300', 'C-': 'bg-orange-200',
                                                            'D': 'bg-red-400', 'F': 'bg-red-500'
                                                        };
                                                        return (
                                                            <div key={grade} className="flex flex-col items-center gap-0.5" title={`${grade}: ${count} (${pct.toFixed(1)}%)`}>
                                                                <div
                                                                    className={`w-4 rounded-t ${gradeColors[grade]}`}
                                                                    style={{ height: `${Math.max(pct * 0.6, 2)}px` }}
                                                                />
                                                                <span className="text-[9px] text-gray-500 dark:text-gray-400">{grade}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="text-xs space-y-1">
                                                <div className="flex gap-4">
                                                    <span className="text-gray-500 dark:text-gray-400">Std Dev:</span>
                                                    <span className="font-medium text-gray-700 dark:text-gray-200">{course.stdDev || 'N/A'}</span>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-gray-500 dark:text-gray-400">Semesters:</span>
                                                    <span className="font-medium text-gray-700 dark:text-gray-200">{course.semesters?.length || 0}</span>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span className="text-gray-500 dark:text-gray-400">Level:</span>
                                                    <span className="font-medium text-gray-700 dark:text-gray-200">{course.level}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
