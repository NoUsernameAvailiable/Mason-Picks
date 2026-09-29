import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CourseCard from './components/CourseCard';
import CourseTable from './components/CourseTable';
import ProfessorModal from './components/ProfessorModal';
import { Search, ArrowUpDown, LayoutGrid, List, Shuffle, X, SlidersHorizontal } from 'lucide-react';

import { createCourseMatcher } from './utils/courseSearch';

const ITEMS_PER_PAGE = 50;

// Parse URL params on mount
function getInitialState() {
    const params = new URLSearchParams(window.location.search);
    let savedView;
    try { savedView = localStorage.getItem('mason-picks-view'); } catch { /* Storage may be unavailable in private sessions. */ }
    const view = params.get('view') || savedView;
    const sort = params.get('sort');
    const level = params.get('level');
    const minimum = Number(params.get('min') || 0);
    return {
        searchTerm: params.get('q') || '',
        minStudents: Math.max(0, Math.min(1000000, Number(params.get('students')) || 0)),
        minGPA: [0, 2, 3, 3.5, 4].includes(minimum) ? minimum : 0,
        selectedSubject: params.get('subject') || 'All',
        selectedLevel: ['100', '200', '300', '400', '500+'].includes(level) ? level : 'All',
        sortKey: ['gpa', 'medianGpa', 'totalStudents', 'instructor', 'code'].includes(sort) ? sort : 'gpa',
        sortDir: params.get('dir') === 'asc' ? 'asc' : 'desc',
        viewMode: view === 'grid' ? 'grid' : 'table',
    };
}

function App() {
    const [initial] = useState(getInitialState);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(initial.searchTerm);
    const [debouncedSearch, setDebouncedSearch] = useState(initial.searchTerm);
    const [minStudents, setMinStudents] = useState(initial.minStudents);
    const [minGPA, setMinGPA] = useState(initial.minGPA);
    const [selectedSubject, setSelectedSubject] = useState(initial.selectedSubject);
    const [selectedLevel, setSelectedLevel] = useState(initial.selectedLevel);
    const [sortConfig, setSortConfig] = useState({ key: initial.sortKey, direction: initial.sortDir });
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState(initial.viewMode);
    const [selectedProfessor, setSelectedProfessor] = useState(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);
    const debounceRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        fetch('/data/courses.json', { signal: controller.signal })
            .then(res => { if (!res.ok) throw new Error('Data unavailable'); return res.json(); })
            .then(data => { setCourses(data); setLoading(false); })
            .catch(err => { if (err.name !== 'AbortError') { setError(true); setLoading(false); } });
        return () => controller.abort();
    }, [retry]);

    //(shareable links)
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('q', debouncedSearch);
        if (minStudents > 0) params.set('students', minStudents.toString());
        if (minGPA > 0) params.set('min', minGPA.toString());
        if (selectedSubject !== 'All') params.set('subject', selectedSubject);
        if (selectedLevel !== 'All') params.set('level', selectedLevel);
        if (sortConfig.key !== 'gpa') params.set('sort', sortConfig.key);
        if (sortConfig.direction !== 'desc') params.set('dir', sortConfig.direction);
        params.set('view', viewMode);

        const search = params.toString();
        const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
        window.history.replaceState(null, '', newUrl);
    }, [debouncedSearch, minStudents, minGPA, selectedSubject, selectedLevel, sortConfig, viewMode]);

    // Persist view mode
    useEffect(() => {
        try { localStorage.setItem('mason-picks-view', viewMode); } catch { /* Keep the current view usable without storage. */ }
    }, [viewMode]);

    const uniqueSubjects = useMemo(() => {
        const subjects = new Set(courses.map(c => c.subject));
        return ['All', ...Array.from(subjects).sort()];
    }, [courses]);

    const levelOptions = ['All', '100', '200', '300', '400', '500+'];

    // Pre-compute section map for best section picker
    const sectionMap = useMemo(() => {
        const map = new Map();
        courses.forEach(c => {
            const key = c.courseKey;
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(c);
        });
        return map;
    }, [courses]);

    const filteredCourses = useMemo(() => {
        let result = courses;

        if (debouncedSearch) {
            result = result.filter(createCourseMatcher(debouncedSearch, uniqueSubjects));
        }

        if (minStudents > 0) result = result.filter(course => course.totalStudents >= minStudents);

        if (minGPA > 0) {
            result = result.filter(course => parseFloat(course.gpa) >= minGPA);
        }

        if (selectedSubject !== 'All') {
            result = result.filter(course => course.subject === selectedSubject);
        }

        if (selectedLevel !== 'All') {
            result = result.filter(course => {
                if (selectedLevel === '500+') {
                    const num = parseInt(course.courseNumber, 10);
                    return num >= 500;
                }
                return course.level === selectedLevel;
            });
        }

        return [...result].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Handle numeric vs string comparison
            if (['gpa', 'medianGpa', 'totalStudents'].includes(sortConfig.key)) {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            } else {
                aValue = (aValue || '').toString().toLowerCase();
                bValue = (bValue || '').toString().toLowerCase();
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [courses, uniqueSubjects, debouncedSearch, minStudents, minGPA, selectedSubject, selectedLevel, sortConfig]);

    const displayedCourses = useMemo(() => {
        return filteredCourses.slice(0, page * ITEMS_PER_PAGE);
    }, [filteredCourses, page]);

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setPage(1);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setDebouncedSearch(value), 200);
    };

    const handleSort = useCallback((key) => {
        setPage(1);
        setSortConfig(current => ({
            key,
            direction: current.key === key ? (current.direction === 'desc' ? 'asc' : 'desc') : (['code', 'instructor'].includes(key) ? 'asc' : 'desc')
        }));
    }, []);

    const handleRandomCourse = () => {
        // Filter for "easy" courses: GPA >= 3.5 and >= 20 students
        const easyCourses = courses.filter(c => parseFloat(c.gpa) >= 3.5 && c.totalStudents >= 20);
        if (easyCourses.length === 0) return;

        const pick = easyCourses[Math.floor(Math.random() * easyCourses.length)];

        setMinGPA(0); setMinStudents(0);
        setSelectedSubject('All');
        setSelectedLevel('All');
        const term = `${pick.code} ${pick.instructor}`;
        setSearchTerm(term);
        setDebouncedSearch(term);
        setSortConfig({ key: 'gpa', direction: 'desc' });
        setPage(1);

        clearTimeout(debounceRef.current);
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setSelectedProfessor(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const resetFilters = () => {
        clearTimeout(debounceRef.current);
        setSearchTerm(''); setDebouncedSearch(''); setMinGPA(0); setMinStudents(0);
        setSelectedSubject('All'); setSelectedLevel('All'); setPage(1);
    };
    const activeFilters = Number(selectedSubject !== 'All') + Number(selectedLevel !== 'All') + Number(minGPA > 0) + Number(minStudents > 0);
    const hasFilters = activeFilters > 0 || searchTerm.length > 0;
    const coverage = useMemo(() => {
        const years = courses.flatMap(c => (c.semesterData || []).map(s => s.year));
        return years.length ? `${years.reduce((a, b) => Math.min(a, b))}–${years.reduce((a, b) => Math.max(a, b))}` : '';
    }, [courses]);

    return (
        <div className="site-shell">
            <Header />
            <main id="main-content" className="page-width main-content">
                <section className="search-section" aria-labelledby="search-heading">
                    <div className="intro-row">
                        <div><h1 id="search-heading">The GMU course guide</h1>
                        <p className="intro-copy">Compare courses and professors with historical grade data.</p></div>
                        {coverage && <p className="coverage">University records<span>{coverage}</span></p>}
                    </div>
                    <div className="search-box">
                        <Search size={23} aria-hidden="true" />
                        <input id="search-input" aria-label="Search courses and professors" type="search" placeholder="Try a course, professor, or subject" value={searchTerm} onChange={handleSearch} />
                        {searchTerm && <button className="icon-button" aria-label="Clear search" onClick={() => { clearTimeout(debounceRef.current); setSearchTerm(''); setDebouncedSearch(''); setPage(1); }}><X size={18} /></button>}
                    </div>
                    <div className="filter-actions">
                        <button className="control mobile-filter-toggle" aria-expanded={filtersOpen} aria-controls="course-filters" onClick={() => setFiltersOpen(v => !v)}><SlidersHorizontal size={16} /> Filters{activeFilters ? ` (${activeFilters})` : ''}</button>
                        <div id="course-filters" className={`filter-fields ${filtersOpen ? 'is-open' : ''}`}>
                            <label>Subject<select id="subject-filter" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setPage(1); }}>{uniqueSubjects.map(subject => <option key={subject} value={subject}>{subject === 'All' ? 'All subjects' : subject}</option>)}</select></label>
                            <label>Course level<select id="level-filter" value={selectedLevel} onChange={e => { setSelectedLevel(e.target.value); setPage(1); }}>{levelOptions.map(level => <option key={level} value={level}>{level === 'All' ? 'All levels' : `${level}-level`}</option>)}</select></label>
                            <label>Average GPA<select id="gpa-filter" value={minGPA} onChange={e => { setMinGPA(Number(e.target.value)); setPage(1); }}><option value="0">Any GPA</option><option value="4">4.0 only</option><option value="3.5">3.5 or above</option><option value="3">3.0 or above</option><option value="2">2.0 or above</option></select></label>
                            <div className="student-filter"><div className="student-filter-heading"><label htmlFor="students-filter">Minimum students</label><details className="filter-help"><summary aria-label="Why filter by student count?">?</summary><p>Small samples can make a GPA misleading. Raise the minimum to exclude results based on only a handful of students. Counts cover all recorded terms for each course–instructor pair; a larger count does not guarantee multiple semesters. Check recorded terms in Grade details.</p></details></div><input id="students-filter" type="number" min="0" max="1000000" step="1" value={minStudents || ''} placeholder="Any count" onChange={e => { setMinStudents(Math.max(0, Math.min(1000000, Math.floor(Number(e.target.value)) || 0))); setPage(1); }} /></div>
                        </div>
                        <button id="random-course-btn" className="discovery-button" onClick={handleRandomCourse} disabled={loading || error} title="Pick a course with a historical GPA of at least 3.5 and at least 20 students"><Shuffle size={16} />I'm Feeling Lucky</button>
                    </div>
                </section>
                {activeFilters > 0 && <div className="active-filters" aria-label="Active filters">
                    <span>Filtered by</span>
                    {minStudents > 0 && <button onClick={() => { setMinStudents(0); setPage(1); }} aria-label="Remove minimum students filter">{minStudents.toLocaleString()}+ students<X size={13} aria-hidden="true" /></button>}
                    {selectedSubject !== 'All' && <button onClick={() => { setSelectedSubject('All'); setPage(1); }} aria-label={`Remove subject filter: ${selectedSubject}`}>{selectedSubject}<X size={13} aria-hidden="true" /></button>}
                    {selectedLevel !== 'All' && <button onClick={() => { setSelectedLevel('All'); setPage(1); }} aria-label={`Remove level filter: ${selectedLevel}`}>{selectedLevel}-level<X size={13} aria-hidden="true" /></button>}
                    {minGPA > 0 && <button onClick={() => { setMinGPA(0); setPage(1); }} aria-label={`Remove GPA filter: ${minGPA}`}>{minGPA === 4 ? '4.0 GPA' : `${minGPA.toFixed(1)}+ GPA`}<X size={13} aria-hidden="true" /></button>}
                </div>}
                <section aria-label="Course results">
                    <div className="results-toolbar">
                        <div className="results-summary" role="status"><strong>{loading ? 'Loading courses…' : error ? 'Courses unavailable' : `${filteredCourses.length.toLocaleString()} ${filteredCourses.length === 1 ? 'result' : 'results'}`}</strong>{hasFilters && <button className="text-button" onClick={resetFilters}>Reset filters</button>}</div>
                        <div className="result-options"><label className="sort-label">Sort by<select id="sort-select" value={sortConfig.key} onChange={e => handleSort(e.target.value)}><option value="gpa">Average GPA</option><option value="medianGpa">Median GPA</option><option value="totalStudents">Student count</option><option value="instructor">Instructor</option><option value="code">Course</option></select></label>
                        <button id="sort-direction-btn" className="icon-button" onClick={() => handleSort(sortConfig.key)} aria-label={`Sort ${sortConfig.direction === 'asc' ? 'descending' : 'ascending'}`} title={`Currently ${sortConfig.direction === 'asc' ? 'ascending' : 'descending'}`}><ArrowUpDown size={17} /></button>
                        <div className="view-switch" aria-label="Result layout"><button id="table-view-btn" aria-label="List view" aria-pressed={viewMode === 'table'} onClick={() => setViewMode('table')}><List size={18} /></button><button id="grid-view-btn" aria-label="Grid view" aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}><LayoutGrid size={17} /></button></div></div>
                    </div>
                    <p className="data-note">Historical averages, not a prediction of your grade. Each result is a course–instructor pairing.</p>
                    {loading ? <div className="loading-rows" aria-label="Loading course results">{[1,2,3,4].map(i => <div key={i} />)}</div> : error ? <div className="empty-state" role="alert"><h2>Course data couldn’t load.</h2><p>Check your connection and try again.</p><button className="control" onClick={() => { setError(false); setLoading(true); setRetry(v => v + 1); }}>Try again</button></div> : displayedCourses.length === 0 ? <div className="empty-state"><Search size={28} /><h2>No matches this time.</h2><p>Try a course code like “CS 112” or remove a filter.</p><button className="control" onClick={resetFilters}>Clear search and filters</button></div> : viewMode === 'table' ? <CourseTable courses={displayedCourses} sortConfig={sortConfig} onSort={handleSort} onProfessorClick={setSelectedProfessor} sectionMap={sectionMap} /> : <div className="course-grid">{displayedCourses.map(course => <CourseCard key={course.id} course={course} sectionMap={sectionMap} onProfessorClick={setSelectedProfessor} />)}</div>}
                    {!loading && !error && displayedCourses.length > 0 && <div className="results-end"><span>Showing {displayedCourses.length.toLocaleString()} of {filteredCourses.length.toLocaleString()} {filteredCourses.length === 1 ? 'result' : 'results'}</span>{displayedCourses.length < filteredCourses.length && <button id="load-more-btn" className="control" onClick={() => setPage(p => p + 1)}>Show 50 more</button>}</div>}
                </section>
            </main>
            <Footer />
            {selectedProfessor && <ProfessorModal professor={selectedProfessor} courses={courses} onClose={() => setSelectedProfessor(null)} />}
        </div>
    );
}
export default App;
