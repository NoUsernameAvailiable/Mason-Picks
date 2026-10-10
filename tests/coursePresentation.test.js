import test from 'node:test';
import assert from 'node:assert/strict';
import { historicalStanding, chronologicalTerms, calculateARate, getGradingTier, getRateMyProfessorsUrl } from '../src/utils/coursePresentation.js';

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
test('getRateMyProfessorsUrl returns valid GMU search URL or null for TBA/Staff', () => {
    assert.equal(getRateMyProfessorsUrl('Correa Vanessa'), 'https://www.ratemyprofessors.com/search/professors/352?q=Correa%20Vanessa');
    assert.equal(getRateMyProfessorsUrl('TBA'), null);
    assert.equal(getRateMyProfessorsUrl('Staff'), null);
    assert.equal(getRateMyProfessorsUrl(''), null);
});

