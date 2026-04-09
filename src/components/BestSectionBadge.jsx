import React, { useState, useMemo } from 'react';
import { Star, Users, ChevronDown, ChevronUp, X } from 'lucide-react';

export default function BestSectionBadge({ course, sectionMap }) {
    const [showComparison, setShowComparison] = useState(false);

    const sections = sectionMap?.get(course.courseKey) || [];

    if (sections.length <= 1) return null;

    const sorted = useMemo(() => {
        return [...sections].sort((a, b) => parseFloat(b.gpa) - parseFloat(a.gpa));
    }, [sections]);

    const isBest = sorted[0]?.id === course.id;
    const bestGpa = parseFloat(sorted[0]?.gpa || 0);

    const gpaColor = (gpa) => {
        const num = parseFloat(gpa);
        if (num >= 3.5) return 'text-emerald-400';
        if (num >= 3.0) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowComparison(!showComparison);
                }}
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    isBest
                        ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/30'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                }`}
            >
                {isBest ? (
                    <>
                        <Star size={10} className="fill-current" />
                        Best section
                    </>
                ) : (
                    <>
                        <Users size={10} />
                        {sections.length} sections
                    </>
                )}
                {showComparison ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>

            {showComparison && (
                <div
                    className="absolute left-0 top-full mt-1 z-30 w-72 bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-gray-700/50 p-3 animate-fade-in"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white">
                            Compare {sections.length} sections
                        </span>
                        <button
                            onClick={() => setShowComparison(false)}
                            className="text-gray-400 hover:text-white p-0.5"
                        >
                            <X size={12} />
                        </button>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {sorted.map((sec, idx) => {
                            const isCurrentBest = idx === 0;
                            return (
                                <div
                                    key={sec.id}
                                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs ${
                                        sec.id === course.id
                                            ? 'bg-blue-500/15 border border-blue-500/30'
                                            : isCurrentBest
                                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                                : 'bg-gray-800/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        {isCurrentBest && <Star size={10} className="text-emerald-400 fill-current shrink-0" />}
                                        <span className="text-gray-200 truncate" title={sec.instructor}>{sec.instructor}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-2">
                                        <span className={`font-bold ${gpaColor(sec.gpa)}`}>{sec.gpa}</span>
                                        <span className="text-gray-500">{sec.totalStudents} st.</span>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
