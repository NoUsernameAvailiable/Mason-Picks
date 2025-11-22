import React from 'react';

export default function CourseCard({ course }) {
    const gpaColor = (gpa) => {
        const num = parseFloat(gpa);
        if (num >= 3.5) return 'text-green-600';
        if (num >= 3.0) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{course.code}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1" title={course.title}>{course.title}</p>
                </div>
                <div className="text-right">
                    <div className={`text-xl font-bold ${gpaColor(course.gpa)}`}>
                        {course.gpa}
                    </div>
                    <div className="text-xs text-gray-500">Mean</div>
                    <div className={`text-lg font-semibold ${gpaColor(course.medianGpa)} mt-1`}>
                        {course.medianGpa}
                    </div>
                    <div className="text-xs text-gray-500">Median</div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span className="font-medium truncate max-w-[60%]">{course.instructor}</span>
                <span>{course.totalStudents} students</span>
            </div>
        </div>
    );
}
