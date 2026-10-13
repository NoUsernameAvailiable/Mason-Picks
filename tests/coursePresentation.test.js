import test from 'node:test';
import assert from 'node:assert/strict';
import { historicalStanding, chronologicalTerms, calculateARate, getGradingTier, getRateMyProfessorsUrl, getRateMyProfessorsTarget, formatSearchName, resolveViewMode } from '../src/utils/coursePresentation.js';

test('highest GPA recognizes all displayed ties without marking lower averages', () => {
    const peers = [{ gpa:'4.00' }, { gpa:'4.00' }, { gpa:'3.75' }];
    assert.equal(historicalStanding(peers[0], peers), 'Highest historical GPA · tied');
    assert.equal(historicalStanding(peers[1], peers), 'Highest historical GPA · tied');
    assert.equal(historicalStanding(peers[2], peers), null);
});
test('a single instructor is not presented as a comparison winner', () => {
    assert.equal(historicalStanding({gpa:'4.00'}, [{gpa:'4.00'}]), null);
    assert.equal(historicalStanding({gpa:'4.00'}, [{gpa:'4.00'},{gpa:'3.50'}]), 'Highest historical GPA');
});
test('trend sorts terms chronologically, preserves zero GPA, and leaves source order intact', () => {
    const terms = [{term:'Fall',year:2024,gpa:'3.0'}, {term:'Spring',year:2024,gpa:'0.00'}, {term:'Summer',year:2023,gpa:'2.0'}];
    assert.deepEqual(chronologicalTerms(terms).map(t=>t.gpa), ['2.0','0.00','3.0']);
    assert.equal(terms[0].term, 'Fall');
});
test('calculateARate correctly sums A+, A, A- share or returns null when no grades', () => {
    assert.equal(calculateARate({ grades: { 'A+': 5, 'A': 10, 'A-': 5, 'B': 20 } }), 50);
    assert.equal(calculateARate({ grades: { 'B': 10 } }), 0);
    assert.equal(calculateARate({ grades: {} }), null);
    assert.equal(calculateARate(null), null);
});
test('getGradingTier returns correct difficulty tier based on GPA threshold', () => {
    assert.deepEqual(getGradingTier({ gpa: '3.85' }), { label: 'High A-rate', className: 'tier-generous' });
    assert.deepEqual(getGradingTier({ gpa: '3.20' }), { label: 'Balanced', className: 'tier-balanced' });
    assert.deepEqual(getGradingTier({ gpa: '2.40' }), { label: 'Rigorous', className: 'tier-rigorous' });
    assert.equal(getGradingTier({ gpa: '0.00' }), null);
    assert.equal(getGradingTier(null), null);
});
test('getRateMyProfessorsTarget links directly to verified RMP profile with actionText', () => {
    const snyder = getRateMyProfessorsTarget('Snyder Mark');
    assert.equal(snyder.isVerified, true);
    assert.equal(snyder.url, 'https://www.ratemyprofessors.com/professor/1621871');
    assert.equal(snyder.actionText, 'Read RMP reviews ↗');
    assert.equal(snyder.department, 'Computer Science');

    const otten = getRateMyProfessorsTarget('Otten John');
    assert.equal(otten.isVerified, true);
    assert.equal(otten.url, 'https://www.ratemyprofessors.com/professor/1903402');
    assert.equal(otten.actionText, 'Read RMP reviews ↗');
});

test('getRateMyProfessorsTarget falls back to GMU search with natural name order when unverified', () => {
    const unverified = getRateMyProfessorsTarget('Correa Vanessa');
    assert.equal(unverified.isVerified, false);
    assert.equal(unverified.url, 'https://www.ratemyprofessors.com/search/professors/352?q=Vanessa%20Correa');
    assert.equal(unverified.actionText, 'Search RMP ↗');
    assert.equal(unverified.name, 'Vanessa Correa');

    assert.equal(getRateMyProfessorsTarget('TBA'), null);
    assert.equal(getRateMyProfessorsTarget('Staff'), null);
    assert.equal(getRateMyProfessorsTarget(''), null);
});

test('formatSearchName handles compound surnames, aliases, and hyphenated names without mutating original', () => {
    assert.equal(formatSearchName('Correa Vanessa'), 'Vanessa Correa');
    assert.equal(formatSearchName('De La Pena Gary Lee'), 'Gary Lee De La Pena');
    assert.equal(formatSearchName('Broeckelman-Post Melissa'), 'Melissa Broeckelman-Post');
    assert.equal(formatSearchName('Snyder Mark'), 'Mark Snyder');
});

test('getRateMyProfessorsUrl returns target URL or null', () => {
    assert.equal(getRateMyProfessorsUrl('Snyder Mark'), 'https://www.ratemyprofessors.com/professor/1621871');
    assert.equal(getRateMyProfessorsUrl('TBA'), null);
});

test('resolveViewMode defaults to grid when no explicit param or preference exists', () => {

    assert.equal(resolveViewMode(null, null), 'grid');
    assert.equal(resolveViewMode('table', null), 'table');
    assert.equal(resolveViewMode('grid', 'table'), 'grid');
    assert.equal(resolveViewMode(null, 'table'), 'table');
    assert.equal(resolveViewMode(null, 'grid'), 'grid');
    assert.equal(resolveViewMode('invalid', 'garbage'), 'grid');
});



