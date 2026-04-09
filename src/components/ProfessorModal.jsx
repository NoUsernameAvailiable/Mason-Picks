import React, { useState, useMemo } from 'react';
import { X, ArrowUpDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ProfessorModal({ professor, courses, onClose }) {
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

    const gpaColor = (gpa) => {
        const num = parseFloat(gpa);
        if (num >= 3.5) return 'text-emerald-600 dark:text-emerald-400';
        if (num >= 3.0) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };



    const getTrend = () => {
        if (profCourses.length < 2) return null;
        const withRecent = profCourses
            .filter(c => c.semesterData && c.semesterData.length > 0)
            .map(c => ({
                gpa: parseFloat(c.gpa),
                lastYear: c.semesterData[c.semesterData.length - 1].year
            }))
            .sort((a, b) => a.lastYear - b.lastYear);

        if (withRecent.length < 2) return null;
        const first = withRecent.slice(0, Math.ceil(withRecent.length / 2));
        const second = withRecent.slice(Math.ceil(withRecent.length / 2));
        const avgFirst = first.reduce((s, c) => s + c.gpa, 0) / first.length;
        const avgSecond = second.reduce((s, c) => s + c.gpa, 0) / second.length;
        const diff = avgSecond - avgFirst;
        if (Math.abs(diff) < 0.05) return 'stable';
        return diff > 0 ? 'up' : 'down';
    };

    const trend = getTrend();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-gray-800 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-modal-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{professor}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Professor Profile</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Avg GPA</span>
                            <span className={`font-bold ${gpaColor(stats.avgGpa)}`}>{stats.avgGpa}</span>
                            {trend === 'up' && <TrendingUp size={14} className="text-emerald-500 dark:text-emerald-400" />}
                            {trend === 'down' && <TrendingDown size={14} className="text-red-500 dark:text-red-400" />}
                            {trend === 'stable' && <Minus size={14} className="text-gray-400" />}
                        </div>

                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Courses</span>
                            <span className="font-bold text-gray-900 dark:text-white">{stats.uniqueCourses}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 rounded-lg px-3 py-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Students</span>
                            <span className="font-bold text-gray-900 dark:text-white">{stats.totalStudents.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-auto max-h-[calc(85vh-160px)]">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm">
                            <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                {[
                                    { key: 'code', label: 'Course' },
                                    { key: 'title', label: 'Title' },
                                    { key: 'gpa', label: 'Mean' },
                                    { key: 'medianGpa', label: 'Median' },

                                    { key: 'totalStudents', label: 'Students' },
                                ].map(col => (
                                    <th
                                        key={col.key}
                                        className="px-4 py-3 text-left cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors select-none"
                                        onClick={() => handleSort(col.key)}
                                    >
                                        <span className="flex items-center gap-1">
                                            {col.label}
                                            {sortKey === col.key && (
                                                <ArrowUpDown size={12} className={`text-mason-green dark:text-mason-gold ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {sortedCourses.map(course => (
                                <tr
                                    key={course.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{course.code}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[200px] truncate" title={course.title}>{course.title}</td>
                                    <td className={`px-4 py-3 font-bold ${gpaColor(course.gpa)}`}>{course.gpa}</td>
                                    <td className={`px-4 py-3 font-semibold ${gpaColor(course.medianGpa)}`}>{course.medianGpa}</td>

                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{course.totalStudents}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
