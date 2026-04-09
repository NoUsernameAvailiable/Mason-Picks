import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CourseCard from './components/CourseCard';
import CourseTable from './components/CourseTable';
import ProfessorModal from './components/ProfessorModal';
import { Search, ArrowUpDown, LayoutGrid, List, Shuffle, Sparkles, Info } from 'lucide-react';

const ITEMS_PER_PAGE = 50;

// Parse URL params on mount
function getInitialState() {
    const params = new URLSearchParams(window.location.search);
    return {
        searchTerm: params.get('q') || '',
        minGPA: Number(params.get('min') || 0),
        selectedSubject: params.get('subject') || 'All',
        selectedLevel: params.get('level') || 'All',
        sortKey: params.get('sort') || 'gpa',
        sortDir: params.get('dir') || 'desc',
        viewMode: params.get('view') || localStorage.getItem('mason-picks-view') || 'grid',
    };
}

function App() {
    const initial = getInitialState();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(initial.searchTerm);
    const [debouncedSearch, setDebouncedSearch] = useState(initial.searchTerm);
    const [minGPA, setMinGPA] = useState(initial.minGPA);
    const [selectedSubject, setSelectedSubject] = useState(initial.selectedSubject);
    const [selectedLevel, setSelectedLevel] = useState(initial.selectedLevel);
    const [sortConfig, setSortConfig] = useState({ key: initial.sortKey, direction: initial.sortDir });
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState(initial.viewMode);
    const [selectedProfessor, setSelectedProfessor] = useState(null);
    const [luckyAnim, setLuckyAnim] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        fetch('/data/courses.json')
            .then(res => res.json())
            .then(data => {
                setCourses(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading courses:', err);
                setLoading(false);
            });
    }, []);

    //(shareable links)
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('q', debouncedSearch);
        if (minGPA > 0) params.set('min', minGPA.toString());
        if (selectedSubject !== 'All') params.set('subject', selectedSubject);
        if (selectedLevel !== 'All') params.set('level', selectedLevel);
        if (sortConfig.key !== 'gpa') params.set('sort', sortConfig.key);
        if (sortConfig.direction !== 'desc') params.set('dir', sortConfig.direction);
        if (viewMode !== 'grid') params.set('view', viewMode);

        const search = params.toString();
        const newUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
        window.history.replaceState(null, '', newUrl);
    }, [debouncedSearch, minGPA, selectedSubject, selectedLevel, sortConfig, viewMode]);

    // Persist view mode
    useEffect(() => {
        localStorage.setItem('mason-picks-view', viewMode);
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
            const searchWords = debouncedSearch.toLowerCase().trim().split(/\s+/);
            result = result.filter(course => {
                const searchableText = `${course.code} ${course.title} ${course.instructor}`.toLowerCase();
                return searchWords.every(word => searchableText.includes(word));
            });
        }

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

        return result.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Handle numeric vs string comparison
            if (['gpa', 'medianGpa', 'totalStudents', 'withdrawRate'].includes(sortConfig.key)) {
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
    }, [courses, debouncedSearch, minGPA, selectedSubject, selectedLevel, sortConfig]);

    const displayedCourses = useMemo(() => {
        return filteredCourses.slice(0, page * ITEMS_PER_PAGE);
    }, [filteredCourses, page]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setPage(1);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setDebouncedSearch(value), 200);
    };

    const handleSort = useCallback((key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    }, []);

    const handleRandomCourse = () => {
        // Filter for "easy" courses: GPA >= 3.5 and >= 20 students
        const easyCourses = courses.filter(c => parseFloat(c.gpa) >= 3.5 && c.totalStudents >= 20);
        if (easyCourses.length === 0) return;

        const pick = easyCourses[Math.floor(Math.random() * easyCourses.length)];

        setMinGPA(0);
        setSelectedSubject('All');
        setSelectedLevel('All');
        const term = `${pick.code} ${pick.instructor}`;
        setSearchTerm(term);
        setDebouncedSearch(term);
        setSortConfig({ key: 'gpa', direction: 'desc' });
        setPage(1);

        setLuckyAnim(true);
        setTimeout(() => setLuckyAnim(false), 600);
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setSelectedProfessor(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8 space-y-4">
                    {/* Search and Filter Controls */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                            <input
                                id="search-input"
                                type="text"
                                placeholder="Search by course code, title, or professor..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-mason-green dark:focus:ring-mason-gold focus:border-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            <select
                                id="subject-filter"
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-mason-green dark:focus:ring-mason-gold outline-none max-w-[140px] text-sm transition-colors"
                                value={selectedSubject}
                                onChange={(e) => {
                                    setSelectedSubject(e.target.value);
                                    setPage(1);
                                }}
                            >
                                {uniqueSubjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>

                            <select
                                id="level-filter"
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-mason-green dark:focus:ring-mason-gold outline-none text-sm transition-colors"
                                value={selectedLevel}
                                onChange={(e) => {
                                    setSelectedLevel(e.target.value);
                                    setPage(1);
                                }}
                            >
                                {levelOptions.map(level => (
                                    <option key={level} value={level}>
                                        {level === 'All' ? 'All Levels' : `${level}-level`}
                                    </option>
                                ))}
                            </select>

                            {/* GPA filter */}
                            <select
                                id="gpa-filter"
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-mason-green dark:focus:ring-mason-gold outline-none text-sm transition-colors"
                                value={minGPA}
                                onChange={(e) => {
                                    setMinGPA(Number(e.target.value));
                                    setPage(1);
                                }}
                            >
                                <option value="0">All GPAs</option>
                                <option value="4.0">4.0 Only</option>
                                <option value="3.5">3.5+</option>
                                <option value="3.0">3.0+</option>
                                <option value="2.0">2.0+</option>
                            </select>


                            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden transition-colors">
                                <select
                                    id="sort-select"
                                    className="px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
                                    value={sortConfig.key}
                                    onChange={(e) => handleSort(e.target.value)}
                                >
                                    <option value="gpa">Sort by Mean GPA</option>
                                    <option value="medianGpa">Sort by Median GPA</option>
                                    <option value="withdrawRate">Sort by W%</option>
                                    <option value="totalStudents">Sort by Size</option>
                                    <option value="instructor">Sort by Instructor</option>
                                </select>
                                <button
                                    id="sort-direction-btn"
                                    onClick={() => handleSort(sortConfig.key)}
                                    className="px-3 py-2 border-l border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                                    title={sortConfig.direction === 'asc' ? "Ascending" : "Descending"}
                                >
                                    <ArrowUpDown size={16} className={sortConfig.direction === 'asc' ? "transform rotate-180" : ""} />
                                </button>
                            </div>


                            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden transition-colors">
                                <button
                                    id="grid-view-btn"
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 transition-colors ${viewMode === 'grid' ? 'bg-mason-green text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    title="Grid view"
                                >
                                    <LayoutGrid size={16} />
                                </button>
                                <button
                                    id="table-view-btn"
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-2 border-l border-gray-300 dark:border-gray-600 transition-colors ${viewMode === 'table' ? 'bg-mason-green text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    title="Table view"
                                >
                                    <List size={16} />
                                </button>
                            </div>

                            <div className="relative group">
                                <button
                                    id="random-course-btn"
                                    onClick={handleRandomCourse}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg bg-mason-gold text-mason-dark font-semibold text-sm hover:bg-yellow-400 transition-all shadow-sm hover:shadow-md ${luckyAnim ? 'animate-sparkle' : ''}`}
                                >
                                    <Shuffle size={16} />
                                    <span className="hidden sm:inline">I'm Feeling Lucky</span>
                                    <Info size={14} className="opacity-60 hidden sm:inline" />
                                </button>
                                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
                                    Randomly picks a course with GPA ≥ 3.5 and at least 20 students — great for finding easy electives!
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {displayedCourses.length} of {filteredCourses.length} courses
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mason-green"></div>
                    </div>
                ) : (
                    <>
                        {displayedCourses.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">No courses found matching your criteria.</p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setMinGPA(0);
                                        setSelectedSubject('All');
                                        setSelectedLevel('All');
                                    }}
                                    className="text-mason-green dark:text-mason-gold hover:underline font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : viewMode === 'table' ? (
                            <CourseTable
                                courses={displayedCourses}
                                sortConfig={sortConfig}
                                onSort={handleSort}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedCourses.map(course => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        sectionMap={sectionMap}
                                        onProfessorClick={setSelectedProfessor}
                                    />
                                ))}
                            </div>
                        )}

                        {displayedCourses.length > 0 && displayedCourses.length < filteredCourses.length && (
                            <div className="mt-8 text-center">
                                <button
                                    id="load-more-btn"
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition-colors"
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />

            {selectedProfessor && (
                <ProfessorModal
                    professor={selectedProfessor}
                    courses={courses}
                    onClose={() => setSelectedProfessor(null)}
                />
            )}
        </div>
    );
}

export default App;
