import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getDateForFileName } from '../utils/dateUtils.js';

describe('dateUtils', () => {
    it('should return date in YYYYMMDD format', () => {
        const result = getDateForFileName();
        assert.match(result, /^\d{8}$/, 'Date should be 8 digits');
        
        const year = parseInt(result.substring(0, 4));
        const month = parseInt(result.substring(4, 6));
        const day = parseInt(result.substring(6, 8));
        
        assert.ok(year >= 2020 && year <= 2100, 'Year should be reasonable');
        assert.ok(month >= 1 && month <= 12, 'Month should be 1-12');
        assert.ok(day >= 1 && day <= 31, 'Day should be 1-31');
    });
    
    it('should pad month and day with leading zeros', () => {
        const result = getDateForFileName();
        assert.strictEqual(result.length, 8, 'Result should be exactly 8 characters');
    });
});
