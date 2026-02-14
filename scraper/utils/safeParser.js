/**
 * Safely parse JavaScript object literals without executing code
 * This avoids the security risk of using new Function() or eval()
 */

/**
 * Parse a JavaScript object literal string to JSON safely
 * @param {string} jsObjectString - JavaScript object literal as string
 * @returns {Object} Parsed object
 * @throws {Error} If parsing fails or contains unsafe content
 */
const parseJSObjectLiteral = (jsObjectString) => {
    // Security check: Reject if contains function calls, eval, or other dangerous patterns
    const dangerousPatterns = [
        /\beval\s*\(/i,
        /\bFunction\s*\(/i,
        /\bsetTimeout\s*\(/i,
        /\bsetInterval\s*\(/i,
        /\brequire\s*\(/i,
        /\bimport\s*\(/i,
        /\b__proto__\b/,
        /\bconstructor\b/,
        /\.\s*prototype\s*\./,
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(jsObjectString)) {
            throw new Error('Security violation: Dangerous pattern detected in object literal');
        }
    }

    try {
        // Convert JavaScript object literal to valid JSON
        let jsonString = jsObjectString
            // Remove trailing commas before closing braces/brackets
            .replace(/,(\s*[}\]])/g, '$1')
            // Add quotes around unquoted property names
            .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
            // Replace single quotes with double quotes
            .replace(/'/g, '"')
            // Remove any remaining JavaScript-specific syntax
            .trim();

        // Parse as JSON (safe - no code execution)
        const parsed = JSON.parse(jsonString);

        // Validate the result is a plain object
        if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Parsed result is not an object');
        }

        return parsed;
    } catch (error) {
        throw new Error(`Failed to safely parse object literal: ${error.message}`);
    }
};

/**
 * Extract blood group configuration from JavaScript code string
 * Safely extracts object literal without executing any code
 * @param {string} jsCode - JavaScript code containing blood group config
 * @returns {Object} Blood group configuration object
 */
const extractBloodGroupConfig = (jsCode) => {
    try {
        // Clean the code string to extract just the object literal
        let objectLiteral = jsCode.trim();
        
        // Remove 'return' statement if present
        objectLiteral = objectLiteral.replace(/^\s*return\s+/, '');
        
        // Remove any trailing semicolons
        objectLiteral = objectLiteral.replace(/;\s*$/, '');
        
        // Parse safely
        return parseJSObjectLiteral(objectLiteral);
    } catch (error) {
        console.error('Error extracting blood group config:', error);
        throw error;
    }
};

export {
    parseJSObjectLiteral,
    extractBloodGroupConfig
};
