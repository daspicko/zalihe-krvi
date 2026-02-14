import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseStatistics } from '../utils/fetchUtils.js';

describe('fetchUtils', () => {
    describe('parseStatistics', () => {
        it('should parse blood statistics table format correctly', async () => {
            // Mock the actual format used by the statistics endpoint
            const mockTableData = `Krvna grupa|Broj doza\nA+|150\nA-|25\nB+|100\nB-|15\n0+|200\n0-|30\nAB+|50\nAB-|10\nUKUPNO|580`;
            
            // Mock fetch so parseStatistics receives the table without making a real HTTP call
            const originalFetch = global.fetch;
            global.fetch = async () => ({
                text: async () => mockTableData
            });

            try {
                const data = await parseStatistics('http://example.test/statistics');

                assert.strictEqual(data.length, 8, 'Should parse 8 blood groups');
                assert.strictEqual(data[0].type, 'A+', 'First group should be A+');
                assert.strictEqual(data[0].amount, 150, 'First group amount should be 150');
                assert.strictEqual(data[4].type, '0+', 'O+ should be converted to 0+');
                assert.strictEqual(data[5].type, '0-', 'O- should be converted to 0-');
            } finally {
                // Restore original fetch implementation
                global.fetch = originalFetch;
            }
        });
        
        it('should handle blood type normalization', async () => {
            // Provide a table that includes O+/O- and other groups to verify normalization
            const mockTableData = `Krvna grupa|Broj doza\nO+|10\nO-|5\nA+|20\nAB-|7\nUKUPNO|42`;

            const originalFetch = global.fetch;
            global.fetch = async () => ({
                text: async () => mockTableData
            });

            try {
                const data = await parseStatistics('http://example.test/normalization');

                const byType = new Map(data.map(entry => [entry.type, entry.amount]));

                assert.strictEqual(byType.has('0+'), true, 'O+ should normalize to 0+');
                assert.strictEqual(byType.has('0-'), true, 'O- should normalize to 0-');
                assert.strictEqual(byType.has('A+'), true, 'A+ should remain A+');
                assert.strictEqual(byType.has('AB-'), true, 'AB- should remain AB-');
            } finally {
                // Restore original fetch implementation
                global.fetch = originalFetch;
            }
        });
    });
});
