import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CourseCard from './components/CourseCard';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

const ITEMS_PER_PAGE = 50;

function App() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minGPA, setMinGPA] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'gpa', direction: 'desc' });
  const [page, setPage] = useState(1);

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

  const uniqueSubjects = useMemo(() => {
    const subjects = new Set(courses.map(c => c.subject));
    return ['All', ...Array.from(subjects).sort()];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let result = courses;

    if (searchTerm) {
      const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
      result = result.filter(course => {
        const searchableText = `${course.code} ${course.title} ${course.instructor}`.toLowerCase();
        // Check if all search words are present (in any order)
        return searchWords.every(word => searchableText.includes(word));
      });
    }

    if (minGPA > 0) {
      result = result.filter(course => parseFloat(course.gpa) >= minGPA);
    }

    if (selectedSubject !== 'All') {
      result = result.filter(course => course.subject === selectedSubject);
    }

    return result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle numeric vs string comparison
      if (sortConfig.key === 'gpa' || sortConfig.key === 'medianGpa' || sortConfig.key === 'totalStudents') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [courses, searchTerm, minGPA, selectedSubject, sortConfig]);

  const displayedCourses = useMemo(() => {
    return filteredCourses.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredCourses, page]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses, professors, or codes..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-mason-green focus:border-transparent outline-none"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <select
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-mason-green outline-none max-w-[150px]"
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
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-mason-green outline-none"
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

              <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden">
                <select
                  className="px-4 py-2 bg-transparent outline-none cursor-pointer hover:bg-gray-50"
                  value={sortConfig.key}
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value="gpa">Sort by Mean GPA</option>
                  <option value="medianGpa">Sort by Median GPA</option>
                  <option value="totalStudents">Sort by size (in search)</option>
                  <option value="instructor">Sort by Instructor (in search)</option>
                </select>
                <button
                  onClick={() => handleSort(sortConfig.key)}
                  className="px-3 py-2 border-l border-gray-300 hover:bg-gray-50 text-gray-600"
                  title={sortConfig.direction === 'asc' ? "Ascending" : "Descending"}
                >
                  <ArrowUpDown size={16} className={sortConfig.direction === 'asc' ? "transform rotate-180" : ""} />
                </button>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
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
                <p className="text-xl text-gray-600 mb-4">No courses found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setMinGPA(0);
                    setSelectedSubject('All');
                  }}
                  className="text-mason-green hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {displayedCourses.length > 0 && displayedCourses.length < filteredCourses.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-6 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
