import test from 'node:test';
import assert from 'node:assert/strict';
import { historicalStanding, chronologicalTerms } from '../src/utils/coursePresentation.js';

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
