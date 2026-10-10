export function historicalStanding(course, peers = []) {
    const comparable = peers.filter(peer => peer.gpa !== '' && Number.isFinite(Number(peer.gpa)));
    if (comparable.length < 2 || course.gpa === '' || !Number.isFinite(Number(course.gpa))) return null;
    const highest = Math.max(...comparable.map(peer => Number(peer.gpa)));
    if (Number(course.gpa) !== highest) return null;
    const tied = comparable.filter(peer => Number(peer.gpa) === highest).length > 1;
    return tied ? 'Highest historical GPA · tied' : 'Highest historical GPA';
}

export function chronologicalTerms(terms = []) {
    const order = { Spring: 0, Summer: 1, Fall: 2, Winter: 3 };
    return terms.filter(term => term.gpa !== '' && Number.isFinite(Number(term.gpa)) && Number.isFinite(Number(term.year)))
        .map(term => ({ ...term, time: Number(term.year) + (order[term.term] ?? 0) / 4 }))
        .sort((a, b) => a.time - b.time);
}

export function calculateARate(course) {
    if (!course || !course.grades) return null;
    const g = course.grades;
    const aCount = (g['A+'] || 0) + (g['A'] || 0) + (g['A-'] || 0);
    const total = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'].reduce((s, k) => s + (g[k] || 0), 0);
    return total > 0 ? Math.round((aCount / total) * 100) : null;
}

export function getGradingTier(course) {
    const gpa = Number(course?.gpa);
    if (!Number.isFinite(gpa) || gpa <= 0) return null;
    if (gpa >= 3.6) return { label: 'High A-rate', className: 'tier-generous' };
    if (gpa >= 3.0) return { label: 'Balanced', className: 'tier-balanced' };
    return { label: 'Rigorous', className: 'tier-rigorous' };
}

export function getRateMyProfessorsUrl(instructor) {
    if (!instructor) return null;
    const clean = instructor.trim();
    if (!clean || clean.toUpperCase() === 'TBA' || clean.toUpperCase() === 'STAFF') return null;
    return `https://www.ratemyprofessors.com/search/professors/352?q=${encodeURIComponent(clean)}`;
}

