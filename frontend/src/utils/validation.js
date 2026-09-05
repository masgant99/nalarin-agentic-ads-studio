// Validation utilities for user inputs

/**
 * Validates and sanitizes a brand name
 * @param {string} name - The brand name to validate
 * @returns {string} - The sanitized brand name
 * @throws {Error} - If validation fails
 */
export const validateBrandName = (name) => {
    if (!name || name.trim().length === 0) {
        throw new Error('Brand name is required');
    }
    if (name.length > 100) {
        throw new Error('Brand name must be less than 100 characters');
    }
    return name.trim();
};

/**
 * Validates a hex color code
 * @param {string} color - The hex color to validate
 * @returns {string} - The validated color
 * @throws {Error} - If validation fails
 */
export const validateHexColor = (color) => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(color)) {
        throw new Error('Invalid color format. Must be a 6-digit hex code (e.g., #FF5733)');
    }
    return color;
};

/**
 * Validates product name
 * @param {string} name - The product name to validate
 * @returns {string} - The sanitized product name
 * @throws {Error} - If validation fails
 */
export const validateProductName = (name) => {
    if (!name || name.trim().length === 0) {
        throw new Error('Product name is required');
    }
    if (name.length > 100) {
        throw new Error('Product name must be less than 100 characters');
    }
    return name.trim();
};

/**
 * Validates product description
 * @param {string} description - The product description to validate
 * @returns {string} - The sanitized description
 */
export const validateProductDescription = (description) => {
    if (description && description.length > 500) {
        throw new Error('Product description must be less than 500 characters');
    }
    return description.trim();
};

/**
 * Validates brand voice/tone
 * @param {string} voice - The brand voice to validate
 * @returns {string} - The sanitized voice
 */
export const validateBrandVoice = (voice) => {
    if (voice && voice.length > 500) {
        throw new Error('Brand voice must be less than 500 characters');
    }
    return voice.trim();
};

/**
 * Validates text input with configurable max length
 * @param {string} text - The text to validate
 * @param {number} maxLength - Maximum allowed length
 * @param {string} fieldName - Name of the field for error messages
 * @returns {string} - The sanitized text
 */
export const validateTextInput = (text, maxLength, fieldName = 'Input') => {
    if (text && text.length > maxLength) {
        throw new Error(`${fieldName} must be less than ${maxLength} characters`);
    }
    return text.trim();
};
