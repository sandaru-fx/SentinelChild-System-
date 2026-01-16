/**
 * Validates Sri Lankan NIC (National Identity Card) numbers.
 * Supports both old (9 digits + V/X) and new (12 digits) formats.
 */
export const validateNIC = (nic: string): boolean => {
    const oldNicRegex = /^[0-9]{9}[vVxX]$/;
    const newNicRegex = /^[0-9]{12}$/;
    return oldNicRegex.test(nic) || newNicRegex.test(nic);
};

/**
 * Validates Sri Lankan phone numbers (e.g., 0712345678 or +94712345678).
 */
export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    return phoneRegex.test(phone);
};

/**
 * Validates basic email format.
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
