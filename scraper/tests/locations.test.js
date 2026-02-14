import { describe, it } from 'node:test';
import assert from 'node:assert';
import locations from '../locations.js';

describe('locations', () => {
    it('should have valid location data structure', () => {
        assert.ok(Array.isArray(locations), 'Locations should be an array');
        assert.ok(locations.length > 0, 'Should have at least one location');
    });
    
    it('should have all required fields for each location', () => {
        const requiredFields = ['id', 'name', 'address', 'website', 'dataUrl', 'bloodGroups'];
        
        locations.forEach(location => {
            requiredFields.forEach(field => {
                assert.ok(field in location, `Location ${location.name || 'unknown'} should have ${field}`);
            });
        });
    });
    
    it('should have valid address structure', () => {
        locations.forEach(location => {
            assert.ok(typeof location.address === 'object', `Location ${location.name} should have address object`);
            assert.ok('street' in location.address, `Location ${location.name} address should have street`);
            assert.ok('city' in location.address, `Location ${location.name} address should have city`);
            assert.ok('postalCode' in location.address, `Location ${location.name} address should have postalCode`);
        });
    });
    
    it('should have all 8 blood group types for each location', () => {
        const expectedTypes = ['A+', 'A-', 'B+', 'B-', '0+', '0-', 'AB+', 'AB-'];
        
        locations.forEach(location => {
            assert.strictEqual(location.bloodGroups.length, 8, 
                `Location ${location.name} should have 8 blood groups`);
            
            const types = location.bloodGroups.map(g => g.type);
            expectedTypes.forEach(expectedType => {
                assert.ok(types.includes(expectedType), 
                    `Location ${location.name} should have blood group ${expectedType}`);
            });
        });
    });
    
    it('should have valid URLs', () => {
        locations.forEach(location => {
            assert.match(location.website, /^https?:\/\//, 
                `Location ${location.name} website should be a valid URL`);
            assert.match(location.dataUrl, /^https?:\/\//, 
                `Location ${location.name} dataUrl should be a valid URL`);
        });
    });
    
    it('should have unique IDs', () => {
        const ids = locations.map(l => l.id);
        const uniqueIds = new Set(ids);
        assert.strictEqual(ids.length, uniqueIds.size, 'All location IDs should be unique');
    });
});
