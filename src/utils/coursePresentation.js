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
