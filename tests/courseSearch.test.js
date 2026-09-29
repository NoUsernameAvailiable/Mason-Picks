import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createCourseMatcher } from '../src/utils/courseSearch.js';
const courses = JSON.parse(readFileSync(new URL('../public/data/courses.json', import.meta.url)));
const subjects = [...new Set(courses.map(c => c.subject))];
for (const query of ['cs 310', 'CS310', 'CS-310']) {
    test(`${query} matches only CS 310`, () => {
        const found = courses.filter(createCourseMatcher(query, subjects));
        assert.ok(found.length > 0);
        assert.ok(found.every(c => c.subject === 'CS' && String(c.courseNumber) === '310'));
        assert.equal(found.length, courses.filter(c => c.subject === 'CS' && String(c.courseNumber) === '310').length);
    });
}
test('subject query does not match title fragments', () => {
    assert.ok(courses.filter(createCourseMatcher('cs', subjects)).every(c => c.subject === 'CS'));
});
test('title and combined instructor searches remain usable', () => {
    assert.ok(courses.filter(createCourseMatcher('data structures', subjects)).length > 0);
    const course = courses.find(c => c.subject === 'CS' && String(c.courseNumber) === '310');
    assert.ok(createCourseMatcher(`${course.code} ${course.instructor}`, subjects)(course));
});

test('instructor names that resemble subject codes still match after a course code', () => {
    const course = { subject:'CS', courseNumber:'310', code:'CS 310', title:'Data Structures', instructor:'He Example' };
    assert.ok(createCourseMatcher('CS310 He Example', ['CS', 'HE'])(course));
});
