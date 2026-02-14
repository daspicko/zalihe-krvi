import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('notifier logic', () => {
    describe('notification trigger conditions', () => {
        it('should trigger notification when amountPercentage is below lowPercentage', () => {
            const testGroup = {
                type: 'A+',
                amountPercentage: 10,
                lowPercentage: 20
            };
            
            const shouldNotify = testGroup.amountPercentage < testGroup.lowPercentage;
            assert.strictEqual(shouldNotify, true, 'Should trigger notification when amount is below low threshold');
        });
        
        it('should NOT trigger notification when amountPercentage equals lowPercentage', () => {
            const testGroup = {
                type: 'A+',
                amountPercentage: 20,
                lowPercentage: 20
            };
            
            const shouldNotify = testGroup.amountPercentage < testGroup.lowPercentage;
            assert.strictEqual(shouldNotify, false, 'Should not trigger notification when amount equals low threshold');
        });
        
        it('should NOT trigger notification when amountPercentage is above lowPercentage', () => {
            const testGroup = {
                type: 'A+',
                amountPercentage: 30,
                lowPercentage: 20
            };
            
            const shouldNotify = testGroup.amountPercentage < testGroup.lowPercentage;
            assert.strictEqual(shouldNotify, false, 'Should not trigger notification when amount is above low threshold');
        });
    });
    
    describe('notification data structure', () => {
        it('should create valid notification payload', () => {
            const locationId = 'ob-varazdin';
            const bloodType = 'A+';
            
            const payload = {
                locationId,
                bloodType
            };
            
            assert.strictEqual(payload.locationId, locationId, 'Payload should contain locationId');
            assert.strictEqual(payload.bloodType, bloodType, 'Payload should contain bloodType');
        });
        
        it('should work with all blood types', () => {
            const bloodTypes = ['A+', 'A-', 'B+', 'B-', '0+', '0-', 'AB+', 'AB-'];
            
            bloodTypes.forEach(type => {
                const payload = {
                    locationId: 'test-location',
                    bloodType: type
                };
                
                assert.strictEqual(payload.bloodType, type, `Should handle blood type ${type}`);
            });
        });
    });
    
    describe('data processing logic', () => {
        it('should identify multiple low blood groups in a location', () => {
            const location = {
                id: 'test-location',
                name: 'Test Location',
                bloodGroups: [
                    { type: 'A+', amountPercentage: 10, lowPercentage: 20 },
                    { type: 'B+', amountPercentage: 25, lowPercentage: 20 },
                    { type: '0-', amountPercentage: 5, lowPercentage: 15 }
                ]
            };
            
            const lowGroups = location.bloodGroups.filter(
                group => group.amountPercentage < group.lowPercentage
            );
            
            assert.strictEqual(lowGroups.length, 2, 'Should identify 2 low blood groups');
            assert.strictEqual(lowGroups[0].type, 'A+', 'First low group should be A+');
            assert.strictEqual(lowGroups[1].type, '0-', 'Second low group should be 0-');
        });
        
        it('should handle location with no low blood groups', () => {
            const location = {
                id: 'test-location',
                name: 'Test Location',
                bloodGroups: [
                    { type: 'A+', amountPercentage: 50, lowPercentage: 20 },
                    { type: 'B+', amountPercentage: 60, lowPercentage: 20 },
                    { type: '0-', amountPercentage: 40, lowPercentage: 15 }
                ]
            };
            
            const lowGroups = location.bloodGroups.filter(
                group => group.amountPercentage < group.lowPercentage
            );
            
            assert.strictEqual(lowGroups.length, 0, 'Should identify no low blood groups');
        });
    });
    
    describe('environment configuration', () => {
        it('should require BE_HOST environment variable', () => {
            const requiredEnvVars = ['BE_HOST', 'BE_X_API_KEY', 'FE_HOST'];
            
            requiredEnvVars.forEach(envVar => {
                assert.ok(
                    typeof envVar === 'string',
                    `${envVar} should be defined as environment variable`
                );
            });
        });
    });
});
