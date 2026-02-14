import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseJSObjectLiteral, extractBloodGroupConfig } from '../utils/safeParser.js';

describe('safeParser', () => {
    describe('parseJSObjectLiteral', () => {
        it('should parse valid JavaScript object literal', () => {
            const jsObject = `{
                "A+": { max: 100, optMax: 80, optMin: 20, full: 100 },
                "B+": { max: 100, optMax: 75, optMin: 25, full: 100 }
            }`;
            
            const result = parseJSObjectLiteral(jsObject);
            
            assert.strictEqual(result['A+'].max, 100);
            assert.strictEqual(result['A+'].optMax, 80);
            assert.strictEqual(result['B+'].max, 100);
        });
        
        it('should handle unquoted property names', () => {
            const jsObject = `{ max: 100, optMax: 80, optMin: 20 }`;
            
            const result = parseJSObjectLiteral(jsObject);
            
            assert.strictEqual(result.max, 100);
            assert.strictEqual(result.optMax, 80);
            assert.strictEqual(result.optMin, 20);
        });
        
        it('should handle single quotes', () => {
            const jsObject = `{ 'A+': { max: 100 }, 'B+': { max: 90 } }`;
            
            const result = parseJSObjectLiteral(jsObject);
            
            assert.strictEqual(result['A+'].max, 100);
            assert.strictEqual(result['B+'].max, 90);
        });
        
        it('should remove trailing commas', () => {
            const jsObject = `{
                max: 100,
                optMax: 80,
            }`;
            
            const result = parseJSObjectLiteral(jsObject);
            
            assert.strictEqual(result.max, 100);
            assert.strictEqual(result.optMax, 80);
        });
        
        it('should reject dangerous eval() pattern', () => {
            const maliciousCode = `{ test: eval('malicious') }`;
            
            assert.throws(() => {
                parseJSObjectLiteral(maliciousCode);
            }, /Security violation/);
        });
        
        it('should reject dangerous Function() pattern', () => {
            const maliciousCode = `{ test: new Function('alert(1)')() }`;
            
            assert.throws(() => {
                parseJSObjectLiteral(maliciousCode);
            }, /Security violation/);
        });
        
        it('should reject setTimeout pattern', () => {
            const maliciousCode = `{ test: setTimeout(() => {}, 0) }`;
            
            assert.throws(() => {
                parseJSObjectLiteral(maliciousCode);
            }, /Security violation/);
        });
        
        it('should reject require() pattern', () => {
            const maliciousCode = `{ test: require('fs') }`;
            
            assert.throws(() => {
                parseJSObjectLiteral(maliciousCode);
            }, /Security violation/);
        });
        
        it('should reject __proto__ pollution attempt', () => {
            const maliciousCode = `{ "__proto__": { polluted: true } }`;
            
            assert.throws(() => {
                parseJSObjectLiteral(maliciousCode);
            }, /Security violation/);
        });
    });
    
    describe('extractBloodGroupConfig', () => {
        it('should extract blood group config from code string', () => {
            const jsCode = `return {
                "0+": { max: 100, optMax: 80, optMin: 20, full: 100 },
                "A+": { max: 90, optMax: 70, optMin: 15, full: 90 }
            }`;
            
            const result = extractBloodGroupConfig(jsCode);
            
            assert.strictEqual(result['0+'].max, 100);
            assert.strictEqual(result['A+'].max, 90);
        });
        
        it('should handle code without return statement', () => {
            const jsCode = `{
                "0-": { max: 50, tline: 40, bline: 10 }
            }`;
            
            const result = extractBloodGroupConfig(jsCode);
            
            assert.strictEqual(result['0-'].max, 50);
            assert.strictEqual(result['0-'].tline, 40);
        });
        
        it('should remove trailing semicolons', () => {
            const jsCode = `{ "AB+": { max: 100 } };`;
            
            const result = extractBloodGroupConfig(jsCode);
            
            assert.strictEqual(result['AB+'].max, 100);
        });
        
        it('should reject malicious code in config', () => {
            const maliciousCode = `return {
                test: eval('malicious code')
            }`;
            
            assert.throws(() => {
                extractBloodGroupConfig(maliciousCode);
            });
        });
    });
});
