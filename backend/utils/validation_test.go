package utils

import (
	"testing"
)

func TestValidateNIC(t *testing.T) {
	tests := []struct {
		nic      string
		expected bool
	}{
		{"123456789V", true},
		{"123456789X", true},
		{"123456789v", true},
		{"199012345678", true},
		{"12345", false},
		{"ABC123456789", false},
		{"123456789Z", false},
	}

	for _, tt := range tests {
		if result := ValidateNIC(tt.nic); result != tt.expected {
			t.Errorf("ValidateNIC(%s) = %v; want %v", tt.nic, result, tt.expected)
		}
	}
}

func TestValidatePhone(t *testing.T) {
	tests := []struct {
		phone    string
		expected bool
	}{
		{"0712345678", true},
		{"+94712345678", true},
		{"0771234567", true},
		{"12345", false},
		{"0112345678", false},
	}

	for _, tt := range tests {
		if result := ValidatePhone(tt.phone); result != tt.expected {
			t.Errorf("ValidatePhone(%s) = %v; want %v", tt.phone, result, tt.expected)
		}
	}
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		email    string
		expected bool
	}{
		{"test@example.com", true},
		{"user.name@domain.lk", true},
		{"invalid-email", false},
		{"@domain.com", false},
	}

	for _, tt := range tests {
		if result := ValidateEmail(tt.email); result != tt.expected {
			t.Errorf("ValidateEmail(%s) = %v; want %v", tt.email, result, tt.expected)
		}
	}
}
