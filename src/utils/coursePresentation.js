import verifiedProfessors from '../data/verifiedProfessors.json' with { type: 'json' };

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


const KNOWN_NAME_ALIASES = {
    'Correa Vanessa': 'Vanessa Correa',
    'Correa Cabrera Guadalupe': 'Guadalupe Correa-Cabrera',
    'De La Pena Gary Lee': 'Gary Lee De La Pena',
    'Zaman Ahmed Bin': 'Ahmed Bin Zaman',
    'Broeckelman-Post Melissa': 'Melissa Broeckelman-Post',
    'Destine Archange Giscard': 'Archange Destine',
};

const COMPOUND_PREFIXES = ['de la', 'de', 'van der', 'van den', 'van', 'von', 'del', 'dos', 'da', 'di', 'al-', 'el-'];

export function formatSearchName(instructor) {
    if (!instructor) return '';
    const clean = instructor.trim();
    if (!clean) return '';
    if (KNOWN_NAME_ALIASES[clean]) {
        return KNOWN_NAME_ALIASES[clean];
    }

    const lower = clean.toLowerCase();
    for (const prefix of COMPOUND_PREFIXES) {
        if (lower.startsWith(prefix + ' ')) {
            const remainder = clean.slice(prefix.length + 1).trim();
            const remainderParts = remainder.split(/\s+/);
            const surname = clean.slice(0, prefix.length + 1 + remainderParts[0].length);
            const given = remainderParts.slice(1).join(' ');
            return given ? `${given} ${surname}` : clean;
        }
    }

    const parts = clean.split(/\s+/);
    if (parts.length === 1) return clean;
    const surname = parts[0];
    const given = parts.slice(1).join(' ');
    return `${given} ${surname}`;
}

export function getRateMyProfessorsTarget(instructor) {
    if (!instructor) return null;
    const clean = instructor.trim();
    if (!clean || clean.toUpperCase() === 'TBA' || clean.toUpperCase() === 'STAFF') return null;

    const verified = verifiedProfessors[clean];
    if (verified && verified.id) {
        return {
            url: `https://www.ratemyprofessors.com/professor/${verified.id}`,
            isVerified: true,
            actionText: 'Read RMP reviews ↗',
            shortActionText: 'Read reviews ↗',
            name: verified.name,
            department: verified.department,
            school: verified.school || 'George Mason University',
        };
    }

    const searchName = formatSearchName(clean);
    return {
        url: `https://www.ratemyprofessors.com/search/professors/352?q=${encodeURIComponent(searchName)}`,
        isVerified: false,
        actionText: 'Search RMP ↗',
        shortActionText: 'Search RMP ↗',
        name: searchName,
        department: null,
        school: 'George Mason University',
    };
}

export function getRateMyProfessorsUrl(instructor) {
    const target = getRateMyProfessorsTarget(instructor);
    return target ? target.url : null;
}

export function resolveViewMode(urlParam, savedPreference) {
    if (urlParam === 'table' || urlParam === 'grid') return urlParam;
    if (savedPreference === 'table' || savedPreference === 'grid') return savedPreference;
    return 'grid';
}



