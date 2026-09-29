import { useId } from 'react';
import { chronologicalTerms } from '../utils/coursePresentation';

export default function GpaTrend({ course }) {
    const titleId = useId();
    const descriptionId = useId();
    const terms = chronologicalTerms(course.semesterData);
    if (!terms.length) return null;
    const first = terms[0];
    const last = terms[terms.length - 1];
    const x = term => 34 + (term.time - first.time) / (last.time - first.time || 1) * 402;
    const y = term => 124 - Math.max(0, Math.min(4, Number(term.gpa))) / 4 * 104;
    return <div className="gpa-trend">
        <h4>GPA over time</h4>
        {terms.length > 1 ? <svg viewBox="0 0 464 158" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
            <title id={titleId}>Historical average GPA for {course.code}, {course.instructor}</title>
            <desc id={descriptionId}>{terms.length} recorded terms, from {first.semester} ({first.gpa} GPA) to {last.semester} ({last.gpa} GPA). The vertical scale is zero to four. Exact values are listed below.</desc>
            {[0, 1, 2, 3, 4].map(value => <g key={value}><line x1="34" x2="436" y1={124 - value * 26} y2={124 - value * 26} className="trend-grid" /><text x="22" y={128 - value * 26} textAnchor="end">{value}</text></g>)}
            <polyline points={terms.map(term => `${x(term)},${y(term)}`).join(' ')} className="trend-line" />
            {terms.map(term => <circle key={term.semester} cx={x(term)} cy={y(term)} r="3" className="trend-dot"><title>{term.semester}: {term.gpa} GPA, {term.studentCount} students</title></circle>)}
            <text x="34" y="147">{first.semester}</text><text x="436" y="147" textAnchor="end">{last.semester}</text>
        </svg> : <p className="detail-note">One recorded term: {first.semester}. More terms are needed to show a trend.</p>}
        <details className="term-history"><summary>View {terms.length} recorded {terms.length === 1 ? 'term' : 'terms'}</summary><div className="term-list">{terms.map(term => <div key={term.semester}><span>{term.semester}</span><strong>{term.gpa} GPA</strong><small>{Number(term.studentCount).toLocaleString()} {term.studentCount === 1 ? 'student' : 'students'}</small></div>)}</div></details>
    </div>;
}
