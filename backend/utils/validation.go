package utils

import (
	"regexp"
)

// ValidateNIC validates Sri Lankan NIC numbers (9 digits + V/X or 12 digits).
func ValidateNIC(nic string) bool {
	oldNicRegex := regexp.MustCompile(`^[0-9]{9}[vVxX]$`)
	newNicRegex := regexp.MustCompile(`^[0-9]{12}$`)
	return oldNicRegex.MatchString(nic) || newNicRegex.MatchString(nic)
}

// ValidatePhone validates Sri Lankan mobile numbers.
func ValidatePhone(phone string) bool {
	phoneRegex := regexp.MustCompile(`^(?:\+94|0)?7[0-9]{8}$`)
	return phoneRegex.MatchString(phone)
}

// ValidateEmail validates email addresses.
func ValidateEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	return emailRegex.MatchString(email)
}
