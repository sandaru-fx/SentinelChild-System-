import { describe, it, expect } from 'vitest';
import { validateNIC, validatePhone, validateEmail } from './validation';

describe('Validation Utilities', () => {
    describe('validateNIC', () => {
        it('should validate old NIC format (9 digits + V)', () => {
            expect(validateNIC('123456789V')).toBe(true);
            expect(validateNIC('123456789v')).toBe(true);
            expect(validateNIC('123456789X')).toBe(true);
        });

        it('should validate new NIC format (12 digits)', () => {
            expect(validateNIC('199012345678')).toBe(true);
        });

        it('should fail invalid NIC formats', () => {
            expect(validateNIC('12345')).toBe(false);
            expect(validateNIC('ABC123456789')).toBe(false);
            expect(validateNIC('123456789Z')).toBe(false);
        });
    });

    describe('validatePhone', () => {
        it('should validate standard Sri Lankan phone numbers', () => {
            expect(validatePhone('0712345678')).toBe(true);
            expect(validatePhone('0771234567')).toBe(true);
            expect(validatePhone('+94712345678')).toBe(true);
        });

        it('should fail invalid phone numbers', () => {
            expect(validatePhone('12345')).toBe(false);
            expect(validatePhone('0112345678')).toBe(false); // Fix: Landlines don't start with 7
        });
    });

    describe('validateEmail', () => {
        it('should validate correct email addresses', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.lk')).toBe(true);
        });

        it('should fail invalid email addresses', () => {
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('@domain.com')).toBe(false);
        });
    });
});
