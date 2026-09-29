const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const words = value => normalize(value).match(/[a-z0-9]+/g) || [];

export function createCourseMatcher(query, subjects) {
    const knownSubjects = new Set(subjects.map(normalize));
    let remaining = normalize(query);
    let subject;
    let number;
    // Course identifiers are structured fields, never substrings of titles.
    const code = remaining.match(/\b([a-z]+)[\s-]*(\d{3}[a-z]?)\b/);
    if (code && knownSubjects.has(code[1])) {
        [, subject, number] = code;
        remaining = remaining.replace(code[0], ' ');
    }
    const tokens = words(remaining);
    return course => {
        if (subject && (normalize(course.subject) !== subject || normalize(course.courseNumber) !== number)) return false;
        const searchable = words(`${course.code} ${course.title} ${course.instructor}`);
        return tokens.every(token => !subject && tokens.length === 1 && knownSubjects.has(token)
            ? normalize(course.subject) === token
            : searchable.some(word => /^\d+$/.test(token) ? word === token : word.startsWith(token)));
    };
}
